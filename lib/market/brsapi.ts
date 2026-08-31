import type { MarketQuote } from "@/lib/types";
import type { MarketDataProvider } from "@/lib/market/provider";
import { MARKET_CACHE_SECONDS, parseRetryAfterSeconds } from "./quota.ts";
import { classifyMarketProviderError, MarketProviderError, providerErrorFromStatus } from "./reliability.ts";

type BrsMarketRow = {
  symbol?: string;
  name?: string;
  price?: number | string;
  change_percent?: number | string;
  change_value?: number | string;
  time_unix?: number | string;
  unit?: string;
};

type BrsPayload = {
  gold?: BrsMarketRow[];
  currency?: BrsMarketRow[];
  cryptocurrency?: BrsMarketRow[];
};

function asOf(row: BrsMarketRow) {
  const unix = Number(row.time_unix ?? 0);
  return unix > 0 ? new Date(unix * 1000).toISOString() : new Date().toISOString();
}

function tomanValue(row: BrsMarketRow, value: unknown) {
  const numeric = Number(value ?? 0);
  return String(row.unit ?? "").includes("\u0631\u06cc\u0627\u0644") ? numeric / 10 : numeric;
}

function quoteFromTomanRow(row: BrsMarketRow): MarketQuote | null {
  if (!row.symbol) return null;
  const priceToman = tomanValue(row, row.price);
  if (!(priceToman > 0)) return null;
  return {
    symbol: row.symbol,
    name: row.name || row.symbol,
    priceToman,
    changePercent: Number(row.change_percent ?? 0),
    changeValueToman: tomanValue(row, row.change_value),
    asOf: asOf(row),
    source: "brsapi",
  };
}

export class BrsApiProvider implements MarketDataProvider {
  readonly id = "brsapi";
  constructor(private readonly apiKey: string) {}

  async getQuotes(): Promise<MarketQuote[]> {
    let response: Response;
    try {
      response = await fetch(`https://Api.BrsApi.ir/Market/Gold_Currency.php?key=${encodeURIComponent(this.apiKey)}`, {
        next: { revalidate: MARKET_CACHE_SECONDS.brsapiCoreQuotes },
        signal: AbortSignal.timeout(6_000),
      });
    } catch (error) {
      throw classifyMarketProviderError("brsapi", error);
    }
    if (!response.ok) throw providerErrorFromStatus("brsapi", response.status, parseRetryAfterSeconds(response.headers.get("retry-after")));
    let payload: BrsPayload;
    try {
      payload = await response.json() as BrsPayload;
    } catch {
      throw new MarketProviderError("brsapi", "invalid_response");
    }
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
      const priceToman = Number(btc.price ?? 0) * usdToman;
      const changePercent = Number(btc.change_percent ?? 0);
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
      const priceToman = Number(usdt.price ?? 0) * usdToman;
      const changePercent = Number(usdt.change_percent ?? 0);
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
}
