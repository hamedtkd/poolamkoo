import type { Asset, MarketQuote } from "../types.ts";

export type MarketFreshnessState = "fresh" | "stale" | "unavailable" | "not-applicable";

export type AssetMarketFreshness = {
  state: MarketFreshnessState;
  ageHours: number | null;
  maxAgeHours: number;
  asOf?: string;
  automaticRiskReady: boolean;
  expected: boolean;
};

const CORE_SYMBOLS = new Set(["USD", "IR_GOLD_18K", "BTC", "USDT"]);
const CLOCK_SKEW_TOLERANCE_MS = 10 * 60 * 1000;

export function marketFreshnessLimitHours(asset: Pick<Asset, "kind">) {
  if (asset.kind === "crypto") return 2;
  if (asset.kind === "gold" || asset.kind === "currency") return 8;
  if (asset.kind === "stock" || asset.kind === "fund") return 36;
  return 24;
}

export function assetSupportsAutomaticMarketQuote(asset: Pick<Asset, "marketId" | "marketSource" | "symbol">) {
  if (asset.marketId && asset.marketSource) return true;
  return Boolean(asset.symbol && CORE_SYMBOLS.has(asset.symbol));
}

export function marketQuoteAgeHours(quote: Pick<MarketQuote, "asOf">, now = new Date()) {
  const asOf = Date.parse(quote.asOf);
  if (!Number.isFinite(asOf)) return null;
  const delta = now.getTime() - asOf;
  if (delta < -CLOCK_SKEW_TOLERANCE_MS) return null;
  return Math.max(0, delta) / 3_600_000;
}

export function assetMarketFreshness(asset: Pick<Asset, "kind" | "marketId" | "marketSource" | "symbol">, quote: MarketQuote | undefined, now = new Date()): AssetMarketFreshness {
  const expected = assetSupportsAutomaticMarketQuote(asset);
  const maxAgeHours = marketFreshnessLimitHours(asset);
  if (!expected) return { state: "not-applicable", ageHours: null, maxAgeHours, automaticRiskReady: false, expected };
  if (!quote) return { state: "unavailable", ageHours: null, maxAgeHours, automaticRiskReady: false, expected };
  const ageHours = marketQuoteAgeHours(quote, now);
  if (quote.runtimeSource === "snapshot" || ageHours === null || ageHours > maxAgeHours) {
    return { state: "stale", ageHours, maxAgeHours, asOf: quote.asOf, automaticRiskReady: false, expected };
  }
  return { state: "fresh", ageHours, maxAgeHours, asOf: quote.asOf, automaticRiskReady: true, expected };
}
