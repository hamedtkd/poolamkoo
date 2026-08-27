import type { MarketQuote } from "../types";

const CORE_SYMBOLS = ["USD", "IR_GOLD_18K", "BTC"] as const;

export function missingCoreSymbols(primary: readonly MarketQuote[]) {
  const symbols = new Set(primary.map((quote) => quote.symbol));
  return CORE_SYMBOLS.filter((symbol) => !symbols.has(symbol));
}

export function needsCoreFallback(primary: readonly MarketQuote[]) {
  return missingCoreSymbols(primary).length > 0;
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
  const key = (quote: MarketQuote) => quote.marketId ? `exchange:${quote.marketId}` : quote.symbol;
  for (const quote of fallback) result.set(key(quote), quote);
  for (const quote of primary) result.set(key(quote), quote);
  for (const quote of exchange) result.set(key(quote), quote);
  return [...result.values()];
}
