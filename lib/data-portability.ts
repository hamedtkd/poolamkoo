import { LOCAL_DATABASE_SCHEMA_VERSION } from "./app-version.ts";

export type PortableDataPreview = {
  incomes: number;
  funds: number;
  assets: number;
  transactions: number;
  planItems: number;
  watchlist: number;
  alerts: number;
  total: number;
};

const REQUIRED_TABLES = ["allocationRules", "incomes", "allocations", "funds", "assets", "transactions", "settings"] as const;

function countRows(data: Record<string, unknown>, key: string) {
  return Array.isArray(data[key]) ? data[key].length : 0;
}

export function assertSupportedDataSchema(schemaVersion?: number) {
  if (schemaVersion === undefined) return "legacy" as const;
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) throw new Error("نسخه ساختار داده بکاپ معتبر نیست.");
  if (schemaVersion > LOCAL_DATABASE_SCHEMA_VERSION) {
    throw new Error("این داده با نسخه جدیدتری از پولم‌کو ساخته شده است. ابتدا برنامه را به‌روزرسانی کن و دوباره تلاش کن.");
  }
  return schemaVersion === LOCAL_DATABASE_SCHEMA_VERSION ? "current" as const : "older" as const;
}

export function validatePortableData(data: Record<string, unknown>): PortableDataPreview {
  for (const key of REQUIRED_TABLES) {
    if (!Array.isArray(data[key])) throw new Error(`داده ناقص است: بخش ${key} پیدا نشد.`);
  }
  const settings = data.settings as unknown[];
  if (!settings.some((row) => row && typeof row === "object" && (row as { id?: string }).id === "settings")) {
    throw new Error("داده تنظیمات معتبر پولم‌کو را ندارد.");
  }
  const preview = {
    incomes: countRows(data, "incomes"), funds: countRows(data, "funds"), assets: countRows(data, "assets"),
    transactions: countRows(data, "transactions"), planItems: countRows(data, "planItems"),
    watchlist: countRows(data, "marketWatchlist"), alerts: countRows(data, "marketAlerts"), total: 0,
  };
  preview.total = preview.incomes + preview.funds + preview.assets + preview.transactions + preview.planItems + preview.watchlist + preview.alerts;
  return preview;
}
