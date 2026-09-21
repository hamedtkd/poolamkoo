import { buildInvestmentLots, transactionBuyCost, transactionSellProceeds, type InvestmentLot } from "./investment-lots.ts";
import { resolveAssetValuation, type ValuationPriceSource } from "./market/valuation.ts";
import type { Asset, InvestmentTransaction, MarketQuote } from "./types.ts";

export interface InvestmentAssetAnalytics {
  asset: Asset;
  priceSource: ValuationPriceSource;
  priceToman?: number;
  priceAsOf?: string;
  totalBuyToman: number;
  totalSellToman: number;
  openCostToman: number;
  currentValueToman?: number;
  realizedPnlToman: number;
  unrealizedPnlToman?: number;
  totalPnlToman?: number;
  unrealizedReturnPct?: number;
  costSharePct: number;
  valueSharePct?: number;
  lotCount: number;
  openLotCount: number;
  lots: InvestmentLot[];
}

export interface InvestmentAnalyticsSnapshot {
  assets: InvestmentAssetAnalytics[];
  totalBuyToman: number;
  totalSellToman: number;
  openCostToman: number;
  pricedCurrentValueToman: number;
  realizedPnlToman: number;
  unrealizedPnlToman: number;
  totalPnlToman: number;
  pricedOpenCostToman: number;
  priceCoveragePct: number;
  pricingComplete: boolean;
  best?: InvestmentAssetAnalytics;
  worst?: InvestmentAssetAnalytics;
}

export function buildInvestmentAnalytics(
  assets: readonly Asset[],
  transactions: readonly InvestmentTransaction[],
  quotes: readonly MarketQuote[],
): InvestmentAnalyticsSnapshot {
  const rows = assets.map((asset) => buildAssetAnalytics(asset, transactions, quotes));
  const openCostToman = rows.reduce((sum, row) => sum + row.openCostToman, 0);
  const pricedCurrentValueToman = rows.reduce((sum, row) => sum + (row.currentValueToman ?? 0), 0);
  const pricedOpenCostToman = rows.reduce((sum, row) => sum + (row.currentValueToman === undefined ? 0 : row.openCostToman), 0);
  const pricingComplete = rows.every((row) => row.openCostToman <= 0 || row.currentValueToman !== undefined);
  const priced = rows.filter((row) => row.openCostToman > 0 && row.unrealizedReturnPct !== undefined);
  const best = [...priced].sort((a, b) => (b.unrealizedReturnPct ?? -Infinity) - (a.unrealizedReturnPct ?? -Infinity))[0];
  const worst = [...priced].sort((a, b) => (a.unrealizedReturnPct ?? Infinity) - (b.unrealizedReturnPct ?? Infinity))[0];
  const realizedPnlToman = rows.reduce((sum, row) => sum + row.realizedPnlToman, 0);
  const unrealizedPnlToman = rows.reduce((sum, row) => sum + (row.unrealizedPnlToman ?? 0), 0);
  return {
    assets: rows,
    totalBuyToman: rows.reduce((sum, row) => sum + row.totalBuyToman, 0),
    totalSellToman: rows.reduce((sum, row) => sum + row.totalSellToman, 0),
    openCostToman,
    pricedCurrentValueToman,
    realizedPnlToman,
    unrealizedPnlToman,
    totalPnlToman: realizedPnlToman + unrealizedPnlToman,
    pricedOpenCostToman,
    priceCoveragePct: openCostToman > 0 ? pricedOpenCostToman / openCostToman * 100 : 100,
    pricingComplete,
    best,
    worst,
  };
}

function buildAssetAnalytics(asset: Asset, transactions: readonly InvestmentTransaction[], quotes: readonly MarketQuote[]) {
  const valuation = resolveAssetValuation(asset, quotes);
  const priceToman = valuation.price;
  const lotSummary = asset.id ? buildInvestmentLots(transactions, asset.id, priceToman) : buildInvestmentLots([], -1, priceToman);
  const related = transactions.filter((row) => row.assetId === asset.id);
  const totalBuyToman = related.filter((row) => row.type === "buy").reduce((sum, row) => sum + transactionBuyCost(row), 0);
  const totalSellToman = related.filter((row) => row.type === "sell").reduce((sum, row) => sum + transactionSellProceeds(row), 0);
  const unrealizedReturnPct = lotSummary.unrealizedPnlToman === undefined || lotSummary.openCostToman <= 0
    ? undefined
    : lotSummary.unrealizedPnlToman / lotSummary.openCostToman * 100;
  return {
    asset,
    priceSource: valuation.source,
    priceToman,
    priceAsOf: valuation.quote?.snapshotCapturedAt ?? valuation.quote?.asOf,
    totalBuyToman,
    totalSellToman,
    openCostToman: lotSummary.openCostToman,
    currentValueToman: lotSummary.currentValueToman,
    realizedPnlToman: lotSummary.realizedPnlToman,
    unrealizedPnlToman: lotSummary.unrealizedPnlToman,
    totalPnlToman: lotSummary.totalPnlToman,
    unrealizedReturnPct,
    costSharePct: 0,
    valueSharePct: undefined,
    lotCount: lotSummary.lots.length,
    openLotCount: lotSummary.lots.filter((lot) => lot.remainingQuantity > 1e-10).length,
    lots: lotSummary.lots,
  } satisfies InvestmentAssetAnalytics;
}

export function withInvestmentShares(snapshot: InvestmentAnalyticsSnapshot): InvestmentAnalyticsSnapshot {
  const totalCost = snapshot.assets.reduce((sum, row) => sum + row.openCostToman, 0);
  const totalValue = snapshot.assets.reduce((sum, row) => sum + (row.currentValueToman ?? 0), 0);
  return {
    ...snapshot,
    assets: snapshot.assets.map((row) => ({
      ...row,
      costSharePct: totalCost > 0 ? row.openCostToman / totalCost * 100 : 0,
      valueSharePct: row.currentValueToman === undefined || totalValue <= 0 ? undefined : row.currentValueToman / totalValue * 100,
    })),
  };
}
