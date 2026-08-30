import type { ExchangeMarketSource, MarketQuote, MarketSnapshot, MarketSymbol } from "../types.ts";

export type MarketRuntimeSource = "live" | "snapshot";

export type MarketRuntimeTarget = {
  source: ExchangeMarketSource;
  id: string;
};

export type MarketCoverage = {
  live: number;
  snapshot: number;
  total: number;
  newestSnapshotAt?: string;
  oldestSnapshotAt?: string;
};

const CORE_RUNTIME_SYMBOLS: readonly MarketSymbol[] = ["USD", "IR_GOLD_18K", "BTC", "USDT"];

export function marketQuoteKey(quote: Pick<MarketQuote, "marketId" | "source" | "symbol">) {
  if (quote.marketId && (quote.source === "tsetmc" || quote.source === "tindex")) {
    return `${quote.source}:${quote.marketId}`;
  }
  return quote.symbol;
}

export function marketTargetKey(target: MarketRuntimeTarget) {
  return `${target.source}:${target.id}`;
}

export function mergeRuntimeMarketQuotes({
  fresh,
  cached,
  targets,
}: {
  fresh: readonly MarketQuote[];
  cached: readonly MarketSnapshot[];
  targets: readonly MarketRuntimeTarget[];
}) {
  const relevant = new Set<string>([
    ...CORE_RUNTIME_SYMBOLS,
    ...targets.map(marketTargetKey),
    ...fresh.map(marketQuoteKey),
  ]);
  const cachedByKey = newestSnapshots(cached);
  const freshByKey = new Map(fresh.map((quote) => [marketQuoteKey(quote), asLiveQuote(quote)]));
  const orderedKeys = unique([
    ...CORE_RUNTIME_SYMBOLS,
    ...targets.map(marketTargetKey),
    ...fresh.map(marketQuoteKey),
  ]);
  const quotes: MarketQuote[] = [];

  for (const key of orderedKeys) {
    if (!relevant.has(key)) continue;
    const live = freshByKey.get(key);
    if (live) {
      quotes.push(live);
      continue;
    }
    const snapshot = cachedByKey.get(key);
    if (snapshot) quotes.push(asSnapshotQuote(snapshot));
  }

  return { quotes, coverage: marketCoverage(quotes) };
}

export function marketCoverage(quotes: readonly MarketQuote[]): MarketCoverage {
  const snapshots = quotes.filter((quote) => quote.runtimeSource === "snapshot");
  const snapshotTimes = snapshots
    .map((quote) => quote.snapshotCapturedAt)
    .filter((value): value is string => Boolean(value))
    .sort();
  return {
    live: quotes.length - snapshots.length,
    snapshot: snapshots.length,
    total: quotes.length,
    newestSnapshotAt: snapshotTimes.at(-1),
    oldestSnapshotAt: snapshotTimes[0],
  };
}

export function freshMarketQuotes(quotes: readonly MarketQuote[]) {
  return quotes.filter((quote) => quote.runtimeSource !== "snapshot");
}

export function marketQuoteForStorage(quote: MarketQuote): MarketQuote {
  return {
    marketId: quote.marketId,
    symbol: quote.symbol,
    name: quote.name,
    priceToman: quote.priceToman,
    navToman: quote.navToman,
    changePercent: quote.changePercent,
    changeValueToman: quote.changeValueToman,
    asOf: quote.asOf,
    source: quote.source,
  };
}

function newestSnapshots(cached: readonly MarketSnapshot[]) {
  const map = new Map<string, MarketSnapshot>();
  for (const snapshot of cached) {
    const key = marketQuoteKey(snapshot);
    const current = map.get(key);
    if (!current || snapshot.capturedAt > current.capturedAt) map.set(key, snapshot);
  }
  return map;
}

function asLiveQuote(quote: MarketQuote): MarketQuote {
  return { ...marketQuoteForStorage(quote), runtimeSource: "live" };
}

function asSnapshotQuote(snapshot: MarketSnapshot): MarketQuote {
  return {
    ...marketQuoteForStorage(snapshot),
    runtimeSource: "snapshot",
    snapshotCapturedAt: snapshot.capturedAt,
  };
}

function unique(values: readonly string[]) {
  return [...new Set(values)];
}
