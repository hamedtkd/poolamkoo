import type { MarketCandle, MarketHistoryRange, MarketInstrument, MarketQuote } from "@/lib/types";
import { MARKET_CACHE_SECONDS, parseRetryAfterSeconds } from "./quota.ts";
import { classifyMarketProviderError, MarketProviderError, providerErrorFromStatus } from "./reliability.ts";

type TsetmcSearchRow = {
  insCode?: string | number;
  lVal18AFC?: string;
  lVal30?: string;
  flowTitle?: string;
};

type TsetmcSearchPayload = { instrumentSearch?: TsetmcSearchRow[] };

type TsetmcClosingRow = {
  insCode?: string | number;
  dEven?: string | number;
  hEven?: string | number;
  pClosing?: string | number | null;
  pDrCotVal?: string | number | null;
  priceYesterday?: string | number | null;
  priceChange?: string | number | null;
  priceChangePercent?: string | number | null;
  priceFirst?: string | number | null;
  priceMin?: string | number | null;
  priceMax?: string | number | null;
};

type TsetmcQuotePayload = { closingPriceInfo?: TsetmcClosingRow };
type TsetmcHistoryPayload = { closingPriceDaily?: TsetmcClosingRow[] };

const BASE_URL = "https://cdn.tsetmc.com/api";
const DEFAULT_REQUEST_TIMEOUT_MS = 3_500;
const DEFAULT_REQUEST_BUDGET_MS = 8_000;
const REQUEST_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0 (compatible; Poolamkoo/0.30; +https://github.com/hamedtkd/poolamkoo)",
  Referer: "https://www.tsetmc.com/",
  Origin: "https://www.tsetmc.com",
};

function finite(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function rialToToman(value: unknown) {
  const number = finite(value);
  return number === null ? null : number / 10;
}

function dateFromEven(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (year < 1990 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function asOf(row: TsetmcClosingRow) {
  const day = dateFromEven(row.dEven);
  if (!day) return new Date().toISOString();
  const time = String(Math.trunc(finite(row.hEven) ?? 0)).padStart(6, "0").slice(-6);
  const hour = time.slice(0, 2);
  const minute = time.slice(2, 4);
  const second = time.slice(4, 6);
  const parsed = new Date(`${day}T${hour}:${minute}:${second}+03:30`);
  return Number.isNaN(parsed.getTime()) ? `${day}T00:00:00.000Z` : parsed.toISOString();
}

function safeChange(row: TsetmcClosingRow, lastRial: number) {
  const yesterday = finite(row.priceYesterday);
  const suppliedPercent = finite(row.priceChangePercent);
  const suppliedChange = finite(row.priceChange);
  const changeRial = yesterday && yesterday > 0 ? lastRial - yesterday : suppliedChange ?? 0;
  const percent = yesterday && yesterday > 0
    ? ((lastRial - yesterday) / yesterday) * 100
    : suppliedPercent ?? 0;
  return { changePercent: Number.isFinite(percent) ? percent : 0, changeValueToman: changeRial / 10 };
}

export function parseTsetmcSearchPayload(payload: TsetmcSearchPayload): MarketInstrument[] {
  const rows = Array.isArray(payload.instrumentSearch) ? payload.instrumentSearch : [];
  const result = new Map<string, MarketInstrument>();
  for (const row of rows) {
    const id = String(row.insCode ?? "").trim();
    const symbol = row.lVal18AFC?.trim();
    const name = row.lVal30?.trim();
    if (!/^\d+$/.test(id) || !symbol || !name) continue;
    result.set(id, { id, symbol, name, source: "tsetmc" });
    if (result.size >= 12) break;
  }
  return [...result.values()];
}

export function parseTsetmcQuotePayload(
  payload: TsetmcQuotePayload,
  marketId: string,
  identity?: { symbol?: string; name?: string },
): MarketQuote | null {
  const row = payload.closingPriceInfo;
  if (!row) return null;
  const lastRial = finite(row.pDrCotVal) || finite(row.pClosing) || 0;
  if (!(lastRial > 0)) return null;
  const { changePercent, changeValueToman } = safeChange(row, lastRial);
  return {
    marketId,
    symbol: identity?.symbol?.trim() || marketId,
    name: identity?.name?.trim() || identity?.symbol?.trim() || marketId,
    priceToman: lastRial / 10,
    changePercent,
    changeValueToman,
    asOf: asOf(row),
    source: "tsetmc",
  };
}

export function parseTsetmcHistoryPayload(payload: TsetmcHistoryPayload): MarketCandle[] {
  const rows = Array.isArray(payload.closingPriceDaily) ? payload.closingPriceDaily : [];
  return rows.flatMap((row) => {
    const time = dateFromEven(row.dEven);
    const close = rialToToman(row.pClosing) ?? rialToToman(row.pDrCotVal) ?? 0;
    const open = rialToToman(row.priceFirst) ?? close;
    const high = rialToToman(row.priceMax) ?? Math.max(open, close);
    const low = rialToToman(row.priceMin) ?? Math.min(open, close);
    if (!time || !(open > 0 && high > 0 && low > 0 && close > 0)) return [];
    return [{ time, open, high, low, close }];
  }).sort((a, b) => a.time.localeCompare(b.time));
}

function blockedBody(text: string) {
  const normalized = text.toLowerCase();
  return normalized.includes("general error detected") || text.includes("مسدود") || text.includes("دسترسی شما");
}

export class TsetmcProvider {
  readonly id = "tsetmc";
  private readonly requestTimeoutMs: number;
  private readonly deadlineAt: number;

  constructor(options: { requestTimeoutMs?: number; budgetMs?: number } = {}) {
    this.requestTimeoutMs = Math.max(250, options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS);
    this.deadlineAt = Date.now() + Math.max(this.requestTimeoutMs, options.budgetMs ?? DEFAULT_REQUEST_BUDGET_MS);
  }

  async search(query: string): Promise<MarketInstrument[]> {
    const payload = await this.request<TsetmcSearchPayload>(
      `/Instrument/GetInstrumentSearch/${encodeURIComponent(query)}`,
      MARKET_CACHE_SECONDS.tsetmcSearch,
    );
    return parseTsetmcSearchPayload(payload);
  }

  async getQuote(marketId: string): Promise<MarketQuote | null> {
    const payload = await this.request<TsetmcQuotePayload>(
      `/ClosingPrice/GetClosingPriceInfo/${encodeURIComponent(marketId)}`,
      MARKET_CACHE_SECONDS.tsetmcQuote,
    );
    return parseTsetmcQuotePayload(payload, marketId);
  }

  async getQuotes(marketIds: readonly string[]): Promise<MarketQuote[]> {
    const ids = [...new Set(marketIds.filter((id) => /^\d+$/.test(id)))].slice(0, 20);
    const quotes: MarketQuote[] = [];
    const failures: MarketProviderError[] = [];
    for (let index = 0; index < ids.length; index += 4) {
      const chunk = ids.slice(index, index + 4);
      const rows = await Promise.all(chunk.map(async (marketId) => {
        try { return await this.getQuote(marketId); }
        catch (error) {
          failures.push(classifyMarketProviderError("tsetmc", error));
          return null;
        }
      }));
      quotes.push(...rows.filter((quote): quote is MarketQuote => Boolean(quote)));
    }
    if (!quotes.length && failures.length) throw failures[0];
    return quotes;
  }

  async getCandles(marketId: string, range: MarketHistoryRange): Promise<MarketCandle[]> {
    const top = range === "1m" ? 45 : 110;
    const payload = await this.request<TsetmcHistoryPayload>(
      `/ClosingPrice/GetClosingPriceDailyList/${encodeURIComponent(marketId)}/${top}`,
      MARKET_CACHE_SECONDS.tsetmcHistory,
    );
    return parseTsetmcHistoryPayload(payload).slice(range === "1m" ? -31 : -93);
  }

  private async request<T>(path: string, revalidate: number): Promise<T> {
    const remainingBudget = this.deadlineAt - Date.now();
    if (remainingBudget <= 0) throw new MarketProviderError("tsetmc", "timeout");
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        headers: REQUEST_HEADERS,
        next: { revalidate },
        signal: AbortSignal.timeout(Math.max(1, Math.min(this.requestTimeoutMs, remainingBudget))),
      });
    } catch (error) {
      throw classifyMarketProviderError("tsetmc", error);
    }
    const text = await response.text();
    if (!response.ok) throw providerErrorFromStatus("tsetmc", response.status, parseRetryAfterSeconds(response.headers.get("retry-after")));
    if (!text) throw new MarketProviderError("tsetmc", "invalid_response");
    if (blockedBody(text)) throw new MarketProviderError("tsetmc", "blocked");
    try { return JSON.parse(text) as T; }
    catch { throw new MarketProviderError("tsetmc", "invalid_response"); }
  }
}
