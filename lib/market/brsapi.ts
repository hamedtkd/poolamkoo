import type { MarketCandle, MarketHistoryRange, MarketQuote } from "@/lib/types";
import type { MarketDataProvider } from "@/lib/market/provider";
import { attachExchangeIdentity, type ExchangeQuoteTarget } from "./exchange-target.ts";
import { getPersianParts } from "../persian-date.ts";
import { MARKET_CACHE_SECONDS, parseRetryAfterSeconds } from "./quota.ts";
import { classifyMarketProviderError, MarketProviderError, providerErrorFromStatus } from "./reliability.ts";
type BrsMarketRow = {
  symbol?: string; name?: string; price?: number | string; change_percent?: number | string;
  change_value?: number | string; time_unix?: number | string; unit?: string;
};
type BrsPayload = { gold?: BrsMarketRow[]; currency?: BrsMarketRow[]; cryptocurrency?: BrsMarketRow[] };
export type BrsTsetmcHistoryRow = {
  date?: string; time?: string; pmin?: number | string | null; pmax?: number | string | null; py?: number | string | null;
  pf?: number | string | null; pl?: number | string | null; plc?: number | string | null; plp?: number | string | null;
  pc?: number | string | null; pcc?: number | string | null; pcp?: number | string | null;
};
function numeric(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}
function asOf(row: BrsMarketRow) {
  const unix = Number(row.time_unix ?? 0);
  return unix > 0 ? new Date(unix * 1000).toISOString() : new Date().toISOString();
}
function tomanValue(row: BrsMarketRow, value: unknown) {
  const number = numeric(value);
  return String(row.unit ?? "").includes("ریال") ? number / 10 : number;
}
function quoteFromTomanRow(row: BrsMarketRow): MarketQuote | null {
  if (!row.symbol) return null;
  const priceToman = tomanValue(row, row.price);
  if (!(priceToman > 0)) return null;
  return {
    symbol: row.symbol,
    name: row.name || row.symbol,
    priceToman,
    changePercent: numeric(row.change_percent),
    changeValueToman: tomanValue(row, row.change_value),
    asOf: asOf(row),
    source: "brsapi",
  };
}
function persianDateToIsoDate(value: string | undefined) {
  const match = value?.trim().match(/^(\d{4})[-/]?(\d{1,2})[-/]?(\d{1,2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1300 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const gregorianYear = year + 621;
  let start: Date | null = null;
  for (let gregorianDay = 18; gregorianDay <= 24; gregorianDay += 1) {
    const candidate = new Date(Date.UTC(gregorianYear, 2, gregorianDay, 12));
    const parts = getPersianParts(candidate);
    if (parts.year === year && parts.month === 1 && parts.day === 1) {
      start = candidate;
      break;
    }
  }
  if (!start) return null;
  const offset = month <= 6
    ? (month - 1) * 31 + (day - 1)
    : 6 * 31 + (month - 7) * 30 + (day - 1);
  const date = new Date(start.getTime() + offset * 86_400_000);
  const parts = getPersianParts(date);
  if (parts.year !== year || parts.month !== month || parts.day !== day) return null;
  return date.toISOString().slice(0, 10);
}
function historyRows(payload: unknown, depth = 0): BrsTsetmcHistoryRow[] {
  if (Array.isArray(payload)) return payload.filter((row): row is BrsTsetmcHistoryRow => Boolean(row) && typeof row === "object");
  if (!payload || typeof payload !== "object" || depth > 2) return [];
  const object = payload as Record<string, unknown>;
  for (const key of ["data", "history", "rows", "result", "results"]) {
    const rows = historyRows(object[key], depth + 1);
    if (rows.length) return rows;
  }
  for (const value of Object.values(object)) {
    const rows = historyRows(value, depth + 1);
    if (rows.length && rows.some((row) => row.pc != null || row.pl != null)) return rows;
  }
  return [];
}
function sortedHistoryRows(payload: unknown) {
  return historyRows(payload).filter((row) => numeric(row.pc) > 0 || numeric(row.pl) > 0).sort((a, b) => {
    const aKey = `${a.date ?? ""} ${a.time ?? ""}`;
    const bKey = `${b.date ?? ""} ${b.time ?? ""}`;
    return aKey.localeCompare(bKey);
  });
}
export function parseBrsTsetmcHistoryPayload(payload: unknown): MarketCandle[] {
  return sortedHistoryRows(payload).flatMap((row) => {
    const time = persianDateToIsoDate(row.date);
    const closeRial = numeric(row.pc) || numeric(row.pl);
    const openRial = numeric(row.pf) || closeRial;
    const positivePrices = [numeric(row.pf), numeric(row.pc), numeric(row.pl)].filter((value) => value > 0);
    const highRial = numeric(row.pmax) || Math.max(...positivePrices, openRial, closeRial);
    const lowRial = numeric(row.pmin) || Math.min(...positivePrices, openRial, closeRial);
    const close = closeRial / 10;
    const open = openRial / 10;
    const high = highRial / 10;
    const low = lowRial / 10;
    if (!time || !(open > 0 && high > 0 && low > 0 && close > 0) || ![open, high, low, close].every(Number.isFinite)) return [];
    return [{ time, open, high, low, close }];
  });
}
export function parseBrsTsetmcQuote(payload: unknown, target: ExchangeQuoteTarget): MarketQuote | null {
  const row = sortedHistoryRows(payload).at(-1);
  if (!row) return null;
  const closeRial = numeric(row.pc) || numeric(row.pl);
  if (!(closeRial > 0)) return null;
  const previousRial = numeric(row.py);
  const changeRial = numeric(row.pcc) || (previousRial > 0 ? closeRial - previousRial : 0);
  const changePercent = numeric(row.pcp) || (previousRial > 0 ? ((closeRial - previousRial) / previousRial) * 100 : 0);
  const day = persianDateToIsoDate(row.date);
  const time = /^\d{1,2}:\d{2}:\d{2}$/.test(row.time ?? "") ? row.time : "12:30:00";
  const timestamp = day ? new Date(`${day}T${time}+03:30`) : null;
  const quote: MarketQuote = {
    symbol: target.symbol,
    name: target.name,
    priceToman: closeRial / 10,
    changePercent: Number.isFinite(changePercent) ? changePercent : 0,
    changeValueToman: changeRial / 10,
    asOf: timestamp && Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : new Date().toISOString(),
    source: "brsapi",
  };
  return attachExchangeIdentity(quote, target);
}
export class BrsApiProvider implements MarketDataProvider {
  readonly id = "brsapi";
  private readonly apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  async getQuotes(): Promise<MarketQuote[]> {
    const payload = await this.request<BrsPayload>(
      `https://Api.BrsApi.ir/Market/Gold_Currency.php?key=${encodeURIComponent(this.apiKey)}`,
      MARKET_CACHE_SECONDS.brsapiCoreQuotes,
    );
    const gold = Array.isArray(payload.gold) ? payload.gold : [];
    const currency = Array.isArray(payload.currency) ? payload.currency : [];
    const crypto = Array.isArray(payload.cryptocurrency) ? payload.cryptocurrency : [];
    const usd = currency.find((row) => row.symbol === "USD");
    const gold18 = gold.find((row) => row.symbol === "IR_GOLD_18K");
    const tetherIrt = currency.find((row) => row.symbol === "USDT_IRT");
    const btc = crypto.find((row) => row.symbol === "BTC");
    const usdt = crypto.find((row) => row.symbol === "USDT");
    const usdToman = usd ? tomanValue(usd, usd.price) : 0;
    const quotes: MarketQuote[] = [];
    for (const row of [usd, gold18]) {
      if (!row) continue;
      const quote = quoteFromTomanRow(row);
      if (quote) quotes.push(quote);
    }
    if (btc && usdToman > 0) {
      const priceToman = numeric(btc.price) * usdToman;
      const changePercent = numeric(btc.change_percent);
      if (priceToman > 0) quotes.push({
        symbol: "BTC",
        name: btc.name || "Bitcoin",
        priceToman,
        changePercent,
        changeValueToman: Math.round(priceToman * changePercent / 100),
        asOf: asOf(btc),
        source: "brsapi",
      });
    }
    if (tetherIrt) {
      const quote = quoteFromTomanRow({ ...tetherIrt, symbol: "USDT", name: usdt?.name || tetherIrt.name });
      if (quote) quotes.push(quote);
    } else if (usdt && usdToman > 0) {
      const priceToman = numeric(usdt.price) * usdToman;
      const changePercent = numeric(usdt.change_percent);
      if (priceToman > 0) quotes.push({
        symbol: "USDT",
        name: usdt.name || "Tether",
        priceToman,
        changePercent,
        changeValueToman: Math.round(priceToman * changePercent / 100),
        asOf: asOf(usdt),
        source: "brsapi",
      });
    }
    return quotes;
  }
  async getExchangeQuote(target: ExchangeQuoteTarget): Promise<MarketQuote | null> {
    if (!target.symbol.trim()) return null;
    return parseBrsTsetmcQuote(await this.getExchangeHistoryPayload(target.symbol), target);
  }
  async getExchangeQuotes(targets: readonly ExchangeQuoteTarget[]): Promise<MarketQuote[]> {
    const unique = new Map(targets.map((target) => [`${target.source}:${target.id}`, target]));
    const values = [...unique.values()].slice(0, 20);
    const quotes: MarketQuote[] = [];
    const failures: MarketProviderError[] = [];
    for (let index = 0; index < values.length; index += 4) {
      const chunk = values.slice(index, index + 4);
      const rows = await Promise.all(chunk.map(async (target) => {
        try { return await this.getExchangeQuote(target); }
        catch (error) {
          failures.push(classifyMarketProviderError("brsapi", error));
          return null;
        }
      }));
      quotes.push(...rows.filter((quote): quote is MarketQuote => Boolean(quote)));
    }
    if (!quotes.length && failures.length) throw failures[0];
    return quotes;
  }
  async getExchangeCandles(symbol: string, range: MarketHistoryRange): Promise<MarketCandle[]> {
    const candles = parseBrsTsetmcHistoryPayload(await this.getExchangeHistoryPayload(symbol));
    return candles.slice(range === "1m" ? -31 : -93);
  }
  private getExchangeHistoryPayload(symbol: string) {
    const params = new URLSearchParams({ key: this.apiKey, type: "0", l18: symbol });
    return this.request<unknown>(
      `https://Api.BrsApi.ir/Tsetmc/History.php?${params}`,
      MARKET_CACHE_SECONDS.brsapiExchangeHistory,
    );
  }
  private async request<T>(url: string, revalidate: number): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate },
        signal: AbortSignal.timeout(6_000),
      });
    } catch (error) {
      throw classifyMarketProviderError("brsapi", error);
    }
    if (!response.ok) throw providerErrorFromStatus("brsapi", response.status, parseRetryAfterSeconds(response.headers.get("retry-after")));
    try {
      const payload = await response.json() as T | null;
      if (payload == null) throw new MarketProviderError("brsapi", "invalid_response");
      return payload;
    } catch (error) {
      if (error instanceof MarketProviderError) throw error;
      throw new MarketProviderError("brsapi", "invalid_response");
    }
  }
}
