import type { MarketQuote } from "../types";

const CORE_SYMBOLS = ["USD", "IR_GOLD_18K", "BTC"] as const;

export function needsCoreFallback(primary: readonly MarketQuote[]) {
  const symbols = new Set(primary.map((quote) => quote.symbol));
  return CORE_SYMBOLS.some((symbol) => !symbols.has(symbol));
}

export function mergeMarketQuotes({
  fallback = [],
  primary = [],
  exchange = [],
}: {
  fallback?: readonly MarketQuote[];
  primary?: readonly MarketQuote[];
  exchange?: readonly MarketQuote[];
}) {
  const result = new Map<string, MarketQuote>();
  for (const quote of fallback) result.set(quote.symbol, quote);
  for (const quote of primary) result.set(quote.symbol, quote);
  for (const quote of exchange) result.set(quote.symbol, quote);
  return [...result.values()];
}
