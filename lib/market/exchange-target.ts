import type { ExchangeMarketSource, MarketQuote } from "../types.ts";

export type ExchangeQuoteTarget = {
  source: ExchangeMarketSource;
  id: string;
  symbol: string;
  name: string;
};

export function normalizeExchangeSymbol(value: string) {
  return value
    .trim()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s_-]+/g, "")
    .toLocaleLowerCase("fa-IR");
}

export function attachExchangeIdentity(quote: MarketQuote, target: ExchangeQuoteTarget): MarketQuote {
  return {
    ...quote,
    marketId: target.id,
    marketSource: target.source,
    symbol: target.symbol,
    name: target.name,
  };
}

export function parseExchangeTargets(values: readonly string[], limit = 20): ExchangeQuoteTarget[] {
  const targets: ExchangeQuoteTarget[] = [];
  const seen = new Set<string>();
  for (const raw of values.slice(0, limit * 2)) {
    try {
      const value = JSON.parse(raw) as Partial<ExchangeQuoteTarget>;
      const source = value.source === "tsetmc" || value.source === "tindex" ? value.source : null;
      const id = typeof value.id === "string" ? value.id.trim().slice(0, 120) : "";
      const symbol = typeof value.symbol === "string" ? value.symbol.trim().slice(0, 80) : "";
      const name = typeof value.name === "string" ? value.name.trim().slice(0, 160) : "";
      if (!source || !id || !symbol) continue;
      const key = `${source}:${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      targets.push({ source, id, symbol, name: name || symbol });
      if (targets.length >= limit) break;
    } catch {
      // Ignore malformed public query values.
    }
  }
  return targets;
}
