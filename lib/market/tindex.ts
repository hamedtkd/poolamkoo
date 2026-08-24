import type { MarketCandle, MarketHistoryRange, MarketInstrument, MarketQuote } from "../types";

type TindexStockRow = {
  slug?: string; ticker?: string; name?: string; last_price?: number | string | null;
  change?: number | string | null; updated_at?: string | null;
};

type TindexSearchPayload = {
  success?: boolean; data?: { rows?: TindexStockRow[] }; message?: string; message_en?: string;
};

type TindexOverviewPayload = {
  success?: boolean;
  data?: {
    symbol?: { slug?: string; ticker?: string; name?: string };
    quote?: {
      last_price?: number | string | null; last_change?: number | string | null;
      last_change_percent?: number | string | null; updated_at?: string | null;
    };
  };
  message?: string; message_en?: string;
};

type TindexBoardRow = {
  slug?: string; name?: string; price?: number | string | null; unit?: string | null;
  change?: number | string | null; updated_at?: string | null;
};

type TindexBoardsPayload = {
  success?: boolean; data?: Array<{ key?: string; rows?: TindexBoardRow[] }>;
  message?: string; message_en?: string;
};

export type TindexCandlesPayload = {
  success?: boolean;
  data?: {
    slug?: string; range?: string; interval?: string; count?: number; unit?: string; source?: string;
    t?: Array<number | string>; o?: Array<number | string>; h?: Array<number | string>;
    l?: Array<number | string>; c?: Array<number | string>; partial?: boolean[];
  };
  message?: string; message_en?: string;
};

const BASE_URL = "https://tindex.app/api/public";

function numeric(value: unknown) {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function rialToToman(value: unknown) { return numeric(value) / 10; }

function changeValue(price: number, percent: number) {
  const denominator = 1 + percent / 100;
  if (!(price > 0) || denominator <= 0) return 0;
  return price - price / denominator;
}

function boardRow(payload: TindexBoardsPayload, key: string, slug: string) {
  const board = payload.data?.find((item) => item.key === key);
  return board?.rows?.find((row) => row.slug?.toLowerCase() === slug.toLowerCase());
}

function directBoardQuote(row: TindexBoardRow | undefined, symbol: string): MarketQuote | null {
  if (!row) return null;
  const priceToman = numeric(row.price);
  if (!(priceToman > 0)) return null;
  const changePercent = numeric(row.change);
  return {
    symbol, name: row.name || symbol, priceToman, changePercent,
    changeValueToman: changeValue(priceToman, changePercent),
    asOf: row.updated_at || new Date().toISOString(), source: "tindex",
  };
}

export function parseTindexBoardsPayload(payload: TindexBoardsPayload): MarketQuote[] {
  const usd = boardRow(payload, "currency", "USD-EXCHANGE-RATE");
  const gold18 = boardRow(payload, "gold", "GOLD-18K");
  const btc = boardRow(payload, "crypto", "btc");
  const usdQuote = directBoardQuote(usd, "USD");
  const goldQuote = directBoardQuote(gold18, "IR_GOLD_18K");
  const quotes = [usdQuote, goldQuote].filter((quote): quote is MarketQuote => Boolean(quote));

  const btcUsd = numeric(btc?.price);
  if (btc && btcUsd > 0 && usdQuote) {
    const priceToman = btcUsd * usdQuote.priceToman;
    const changePercent = numeric(btc.change);
    quotes.push({
      symbol: "BTC", name: btc.name || "Bitcoin", priceToman, changePercent,
      changeValueToman: changeValue(priceToman, changePercent),
      asOf: btc.updated_at || usdQuote.asOf, source: "tindex",
    });
  }
  return quotes;
}

export function parseTindexSearchPayload(payload: TindexSearchPayload): MarketInstrument[] {
  const rows = Array.isArray(payload.data?.rows) ? payload.data.rows : [];
  return rows.flatMap((row) => {
    if (!row.slug || !row.ticker || !row.name) return [];
    const priceToman = rialToToman(row.last_price);
    return [{
      id: row.slug, symbol: row.ticker, name: row.name,
      priceToman: priceToman > 0 ? priceToman : undefined,
      changePercent: numeric(row.change), source: "tindex" as const,
    }];
  });
}

export function parseTindexOverviewPayload(payload: TindexOverviewPayload): MarketQuote | null {
  const symbol = payload.data?.symbol;
  const quote = payload.data?.quote;
  if (!symbol?.ticker || !quote) return null;
  const priceToman = rialToToman(quote.last_price);
  if (!(priceToman > 0)) return null;
  return {
    symbol: symbol.ticker, name: symbol.name || symbol.ticker, priceToman,
    changePercent: numeric(quote.last_change_percent), changeValueToman: rialToToman(quote.last_change),
    asOf: quote.updated_at || new Date().toISOString(), source: "tindex",
  };
}

function decodedDays(values: Array<number | string>) {
  let day = 0;
  return values.map((value, index) => {
    const next = Math.trunc(numeric(value));
    day = index === 0 ? next : day + next;
    return day;
  });
}

function unitScale(unit: string | undefined) {
  const normalized = (unit ?? "").trim().toLowerCase();
  return normalized === "rial" || normalized.includes("ریال") ? 0.1 : 1;
}

export function parseTindexCandlesPayload(payload: TindexCandlesPayload): MarketCandle[] {
  const data = payload.data;
  const t = Array.isArray(data?.t) ? data.t : [];
  const o = Array.isArray(data?.o) ? data.o : [];
  const h = Array.isArray(data?.h) ? data.h : [];
  const l = Array.isArray(data?.l) ? data.l : [];
  const c = Array.isArray(data?.c) ? data.c : [];
  const length = Math.min(t.length, o.length, h.length, l.length, c.length);
  if (!length) return [];
  const days = decodedDays(t.slice(0, length));
  const scale = unitScale(data?.unit);
  return days.flatMap((day, index) => {
    const open = numeric(o[index]) * scale;
    const high = numeric(h[index]) * scale;
    const low = numeric(l[index]) * scale;
    const close = numeric(c[index]) * scale;
    if (!(day > 0 && open > 0 && high > 0 && low > 0 && close > 0)) return [];
    return [{ time: new Date(day * 86_400_000).toISOString().slice(0, 10), open, high, low, close }];
  });
}

export class TindexProvider {
  readonly id = "tindex";
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  async search(query: string): Promise<MarketInstrument[]> {
    const params = new URLSearchParams({ q: query, per_page: "12", sort: "ticker", dir: "asc" });
    return parseTindexSearchPayload(await this.request<TindexSearchPayload>(`/stocks/by-category/stock-energy?${params}`));
  }

  async getFallbackQuotes(): Promise<MarketQuote[]> {
    return parseTindexBoardsPayload(await this.request<TindexBoardsPayload>("/boards"));
  }

  async getQuote(marketId: string): Promise<MarketQuote | null> {
    const payload = await this.request<TindexOverviewPayload>(`/stock-market/symbol/${encodeURIComponent(marketId)}/overview`);
    return parseTindexOverviewPayload(payload);
  }

  async getQuotes(marketIds: readonly string[]): Promise<MarketQuote[]> {
    const quotes: MarketQuote[] = [];
    for (const marketId of [...new Set(marketIds)].slice(0, 20)) {
      try {
        const quote = await this.getQuote(marketId);
        if (quote) quotes.push(quote);
      } catch { /* Keep the rest of the portfolio refresh usable. */ }
    }
    return quotes;
  }

  async getIndicatorCandles(slug: string, range: MarketHistoryRange): Promise<MarketCandle[]> {
    const params = new URLSearchParams({ range, interval: "daily" });
    const payload = await this.request<TindexCandlesPayload>(`/indicators/${encodeURIComponent(slug)}/candles?${params}`);
    return parseTindexCandlesPayload(payload);
  }

  async getExchangeCandles(marketId: string, range: MarketHistoryRange): Promise<MarketCandle[]> {
    const params = new URLSearchParams({ range, interval: "daily" });
    const payload = await this.request<TindexCandlesPayload>(`/stock-market/symbol/${encodeURIComponent(marketId)}/candles?${params}`);
    return parseTindexCandlesPayload(payload);
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json" },
      cache: "no-store", signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => null) as (T & { message?: string; message_en?: string }) | null;
    if (!response.ok || !payload) {
      const message = payload?.message || payload?.message_en || `Tindex ${response.status}`;
      throw new Error(message);
    }
    return payload;
  }
}
