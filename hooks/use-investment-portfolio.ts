"use client";

import { useMemo } from "react";
import { portfolioPosition } from "@/lib/calculations";
import { resolveAssetValuation, type ValuationPriceSource } from "@/lib/market/valuation";
import { buildPortfolioAllocation } from "@/lib/portfolio-allocation";
import type { Asset, InvestmentTransaction, MarketQuote } from "@/lib/types";

export type PositionPriceSource = ValuationPriceSource;

export interface PositionRow {
  asset: Asset;
  quote?: MarketQuote;
  qty: number;
  cost: number;
  avgPrice: number;
  price: number;
  currentValue: number;
  unrealized: number;
  realized: number;
  returnPct: number;
  priceSource: PositionPriceSource;
  pricingReliable: boolean;
}

export function useInvestmentPortfolio(assets: Asset[], transactions: InvestmentTransaction[], quotes: MarketQuote[]) {
  const positions = useMemo<PositionRow[]>(() => assets.map((asset) => {
    const valuation = resolveAssetValuation(asset, quotes);
    const position = portfolioPosition(asset, transactions, valuation.price);
    return {
      asset,
      quote: valuation.quote,
      ...position,
      priceSource: valuation.source,
      pricingReliable: position.qty <= 0 || valuation.decisionReady,
    };
  }), [assets, transactions, quotes]);

  const activePositions = useMemo(() => positions.filter((position) => !position.asset.archived), [positions]);
  const totals = useMemo(() => ({
    value: positions.reduce((sum, row) => sum + row.currentValue, 0),
    cost: positions.reduce((sum, row) => sum + row.cost, 0),
    targetPct: assets.filter((asset) => !asset.archived).reduce((sum, asset) => sum + asset.targetPct, 0),
  }), [assets, positions]);

  const allocation = useMemo(() => buildPortfolioAllocation(activePositions.map((position) => ({
    asset: position.asset,
    currentValue: position.currentValue,
    hasHolding: position.qty > 0,
    pricingReliable: position.pricingReliable,
  }))), [activePositions]);

  return {
    positions,
    allocation,
    totalValue: totals.value,
    totalCost: totals.cost,
    totalPnl: totals.value - totals.cost,
    targetTotal: totals.targetPct,
  };
}
