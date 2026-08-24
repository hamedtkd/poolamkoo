import { normalizeSearchText } from "./search.ts";
import { getPersianParts, toLatinDigits } from "./persian-date.ts";
import type { Asset, InvestmentTransaction } from "./types.ts";

export type HistoricalImportStatus = "valid" | "invalid" | "duplicate";
export type HistoricalTransactionType = "buy" | "sell";

export interface HistoricalCsvRow {
  line: number;
  assetName: string;
  symbol?: string;
  type: HistoricalTransactionType | null;
  quantity: number | null;
  unitPriceToman: number | null;
  happenedAt: string | null;
  note?: string;
  errors: string[];
}

export interface PreparedHistoricalRow extends HistoricalCsvRow {
  asset?: Asset;
  status: HistoricalImportStatus;
}

const headerAliases = {
  asset: ["asset", "asset_name", "name", "دارایی", "نام دارایی", "نام"],
  symbol: ["symbol", "ticker", "نماد", "نماد بازار", "نماد بورسی"],
  type: ["type", "transaction_type", "نوع", "نوع معامله", "عملیات"],
  quantity: ["quantity", "qty", "amount_units", "مقدار", "تعداد", "حجم"],
  price: ["unit_price_toman", "unit_price", "price", "قیمت", "قیمت واحد", "قیمت واحد تومان"],
  date: ["date", "happened_at", "transaction_date", "تاریخ", "تاریخ معامله", "تاریخ خرید"],
  note: ["note", "description", "یادداشت", "توضیح", "توضیحات"],
} as const;

type HeaderKey = keyof typeof headerAliases;
const normalizedAliases = new Map<string, HeaderKey>();
for (const [key, aliases] of Object.entries(headerAliases) as Array<[HeaderKey, readonly string[]]>) {
  for (const alias of aliases) normalizedAliases.set(normalizeHeader(alias), key);
}

export function parseHistoricalCsv(text: string): HistoricalCsvRow[] {
  const matrix = parseCsvMatrix(text);
  if (matrix.length < 2) throw new Error("فایل CSV باید سطر عنوان و حداقل یک ردیف داده داشته باشد.");
  if (matrix.length > 2001) throw new Error("در هر بار حداکثر ۲۰۰۰ ردیف را وارد کن.");

  const headers = new Map<HeaderKey, number>();
  matrix[0].forEach((value, index) => {
    const key = normalizedAliases.get(normalizeHeader(value));
    if (key && !headers.has(key)) headers.set(key, index);
  });
  for (const required of ["asset", "quantity", "price", "date"] as HeaderKey[]) {
    if (!headers.has(required)) throw new Error(`ستون «${requiredHeaderLabel(required)}» در فایل پیدا نشد.`);
  }

  return matrix.slice(1).filter((cells) => cells.some((cell) => cell.trim())).map((cells, index) => {
    const errors: string[] = [];
    const assetName = readCell(cells, headers.get("asset")).trim();
    const symbol = readCell(cells, headers.get("symbol")).trim() || undefined;
    const type = parseType(readCell(cells, headers.get("type")), !headers.has("type"));
    const quantity = parsePositiveNumber(readCell(cells, headers.get("quantity")));
    const unitPriceToman = parsePositiveNumber(readCell(cells, headers.get("price")));
    const happenedAt = parseFlexibleDate(readCell(cells, headers.get("date")));
    const note = readCell(cells, headers.get("note")).trim().slice(0, 200) || undefined;

    if (!assetName && !symbol) errors.push("نام یا نماد دارایی خالی است.");
    if (!type) errors.push("نوع معامله باید خرید یا فروش باشد.");
    if (!quantity) errors.push("مقدار باید عددی بزرگ‌تر از صفر باشد.");
    if (!unitPriceToman) errors.push("قیمت واحد باید عددی بزرگ‌تر از صفر باشد.");
    if (!happenedAt) errors.push("تاریخ معتبر نیست؛ 1405/06/02 یا 2026-08-24 وارد کن.");
    else if (happenedAt > todayIso()) errors.push("تاریخ معامله نمی‌تواند در آینده باشد.");

    return { line: index + 2, assetName, symbol, type, quantity, unitPriceToman, happenedAt, note, errors };
  });
}

export function prepareHistoricalImport(rows: HistoricalCsvRow[], assets: Asset[], existing: InvestmentTransaction[]) {
  const fingerprints = new Set(existing.map((tx) => transactionFingerprint(tx.assetId, tx.type, tx.quantity, tx.unitPriceToman, tx.happenedAt)));
  const fileFingerprints = new Set<string>();
  const prepared: PreparedHistoricalRow[] = rows.map((row) => {
    const errors = [...row.errors];
    const asset = resolveAsset(row, assets);
    if (!asset?.id) errors.push("این دارایی در پولم‌کو پیدا نشد.");
    let status: HistoricalImportStatus = errors.length ? "invalid" : "valid";
    if (status === "valid" && asset?.id && row.type && row.quantity && row.unitPriceToman && row.happenedAt) {
      const fp = transactionFingerprint(asset.id, row.type, row.quantity, row.unitPriceToman, row.happenedAt);
      if (fingerprints.has(fp) || fileFingerprints.has(fp)) status = "duplicate";
      else fileFingerprints.add(fp);
    }
    return { ...row, asset, errors, status };
  });
  validateSellAvailability(prepared, existing);
  return prepared;
}

export function historicalImportSummary(rows: PreparedHistoricalRow[]) {
  return rows.reduce((sum, row) => {
    sum[row.status] += 1;
    return sum;
  }, { valid: 0, invalid: 0, duplicate: 0 } as Record<HistoricalImportStatus, number>);
}

export function toInvestmentTransaction(row: PreparedHistoricalRow, createdAt = new Date().toISOString()): InvestmentTransaction | null {
  if (row.status !== "valid" || !row.asset?.id || !row.type || !row.quantity || !row.unitPriceToman || !row.happenedAt) return null;
  return {
    assetId: row.asset.id,
    type: row.type,
    quantity: row.quantity,
    unitPriceToman: row.unitPriceToman,
    amountToman: row.quantity * row.unitPriceToman,
    happenedAt: row.happenedAt,
    note: row.note,
    createdAt,
  };
}

function validateSellAvailability(rows: PreparedHistoricalRow[], existing: InvestmentTransaction[]) {
  type Event = { kind: "existing"; date: string; tx: InvestmentTransaction } | { kind: "candidate"; date: string; row: PreparedHistoricalRow };
  const candidates = rows.filter((row) => row.status === "valid" && row.asset?.id && row.happenedAt);
  const events: Event[] = [
    ...existing.map((tx): Event => ({ kind: "existing", date: tx.happenedAt, tx })),
    ...candidates.map((row): Event => ({ kind: "candidate", date: row.happenedAt!, row })),
  ];
  events.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === "existing" ? -1 : 1));
  const balances = new Map<number, number>();
  for (const event of events) {
    if (event.kind === "existing") {
      const tx = event.tx;
      const balance = balances.get(tx.assetId) ?? 0;
      balances.set(tx.assetId, balance + (tx.type === "buy" ? tx.quantity : -tx.quantity));
      continue;
    }
    const row = event.row;
    const assetId = row.asset!.id!;
    const balance = balances.get(assetId) ?? 0;
    if (row.type === "sell" && (row.quantity ?? 0) > balance + 1e-10) {
      row.status = "invalid";
      row.errors.push("مقدار فروش در این تاریخ از موجودی ثبت‌شده بیشتر است.");
      continue;
    }
    balances.set(assetId, balance + (row.type === "buy" ? row.quantity! : -row.quantity!));
  }
}

function resolveAsset(row: HistoricalCsvRow, assets: Asset[]) {
  const symbol = row.symbol?.trim().toLocaleUpperCase("en-US");
  if (symbol) {
    const match = assets.find((asset) => asset.symbol?.trim().toLocaleUpperCase("en-US") === symbol);
    if (match) return match;
  }
  const name = normalizeSearchText(row.assetName);
  return name ? assets.find((asset) => normalizeSearchText(asset.name) === name) : undefined;
}

function transactionFingerprint(assetId: number, type: HistoricalTransactionType, quantity: number, price: number, date: string) {
  return `${assetId}|${type}|${quantity.toFixed(8)}|${Math.round(price)}|${date.slice(0, 10)}`;
}

function parseCsvMatrix(input: string) {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const firstLine = text.split("\n").find((line) => line.trim()) ?? "";
  const delimiter = [[",", count(firstLine, ",")], [";", count(firstLine, ";")], ["\t", count(firstLine, "\t")]].sort((a, b) => Number(b[1]) - Number(a[1]))[0][0] as string;
  const rows: string[][] = [[]];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      rows.at(-1)!.push(value); value = "";
    } else if (char === "\n" && !quoted) {
      rows.at(-1)!.push(value); value = ""; rows.push([]);
    } else value += char;
  }
  rows.at(-1)!.push(value);
  return rows.filter((row) => row.some((cell) => cell.trim()));
}

function parseType(value: string, defaultBuy: boolean): HistoricalTransactionType | null {
  if (!value.trim() && defaultBuy) return "buy";
  const normalized = normalizeSearchText(value);
  if (["buy", "خرید", "ورود"].includes(normalized)) return "buy";
  if (["sell", "فروش", "خروج"].includes(normalized)) return "sell";
  return null;
}

function parsePositiveNumber(value: string) {
  const normalized = toLatinDigits(value).replace(/[٬,،\s]/g, "").replace(/٫/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const dateCache = new Map<string, string | null>();
function parseFlexibleDate(value: string) {
  const source = toLatinDigits(value).trim();
  if (dateCache.has(source)) return dateCache.get(source) ?? null;
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(source);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText); const month = Number(monthText); const day = Number(dayText);
  const result = year >= 1300 && year <= 1600 ? persianDateToIso(year, month, day) : gregorianDateToIso(year, month, day);
  dateCache.set(source, result);
  return result;
}

function persianDateToIso(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const start = new Date(year + 621, 2, 1, 12);
  for (let offset = 0; offset < 410; offset += 1) {
    const date = new Date(start); date.setDate(start.getDate() + offset);
    const parts = getPersianParts(date);
    if (parts.year === year && parts.month === month && parts.day === day) return localIso(date);
  }
  return null;
}

function gregorianDateToIso(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? localIso(date) : null;
}

function normalizeHeader(value: string) {
  return normalizeSearchText(value).replace(/[()（）]/g, " ").replace(/[-/]/g, "_").replace(/\s+/g, " ").trim();
}
function readCell(cells: string[], index?: number) { return index === undefined ? "" : cells[index] ?? ""; }
function count(value: string, char: string) { return value.split(char).length - 1; }
function localIso(date: Date) { return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }
function todayIso() { return localIso(new Date()); }
function requiredHeaderLabel(key: HeaderKey) {
  return ({ asset: "دارایی", quantity: "مقدار", price: "قیمت واحد", date: "تاریخ" } as Partial<Record<HeaderKey, string>>)[key] ?? key;
}
