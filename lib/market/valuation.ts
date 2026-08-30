import type { Asset, ExchangeMarketSource, MarketQuote } from "../types.ts";

export type ValuationPriceSource = "live-market" | "snapshot-market" | "manual" | "cost-basis";

export type MarketQuoteTarget = {
  source?: ExchangeMarketSource;
  marketId?: string;
  symbol?: string;
};

export type AssetValuationPrice = {
  quote?: MarketQuote;
  price?: number;
  source: ValuationPriceSource;
  decisionReady: boolean;
};

function positivePrice(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function marketQuoteForTarget(target: MarketQuoteTarget, quotes: readonly MarketQuote[]) {
  if (target.source && target.marketId) {
    return quotes.find((quote) => quote.source === target.source && quote.marketId === target.marketId);
  }
  if (!target.symbol) return undefined;
  return quotes.find((quote) => quote.symbol === target.symbol && !quote.marketId)
    ?? quotes.find((quote) => quote.symbol === target.symbol);
}

export function marketQuoteForAsset(asset: Asset, quotes: readonly MarketQuote[]) {
  return marketQuoteForTarget({ source: asset.marketSource, marketId: asset.marketId, symbol: asset.symbol }, quotes);
}

export function resolveAssetValuation(asset: Asset, quotes: readonly MarketQuote[]): AssetValuationPrice {
  const quote = marketQuoteForAsset(asset, quotes);
  const marketPrice = positivePrice(quote?.priceToman);
  if (marketPrice !== undefined && quote) {
    const snapshot = quote.runtimeSource === "snapshot";
    return {
      quote,
      price: marketPrice,
      source: snapshot ? "snapshot-market" : "live-market",
      decisionReady: !snapshot,
    };
  }

  const manualPrice = positivePrice(asset.manualPriceToman);
  if (manualPrice !== undefined) {
    return { price: manualPrice, source: "manual", decisionReady: true };
  }

  return { source: "cost-basis", decisionReady: false };
}

export function valuationPriceSourceLabel(source: ValuationPriceSource) {
  if (source === "live-market") return "بازار تازه";
  if (source === "snapshot-market") return "Snapshot محلی";
  if (source === "manual") return "قیمت دستی";
  return "بهای خرید fallback";
}
