"use client";

import { useMemo } from "react";
import { portfolioPosition } from "@/lib/calculations";
import { buildPortfolioAllocation } from "@/lib/portfolio-allocation";
import type { Asset, InvestmentTransaction, MarketQuote } from "@/lib/types";

export type PositionPriceSource = "market" | "manual" | "cost-basis";

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

function positivePrice(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function useInvestmentPortfolio(assets: Asset[], transactions: InvestmentTransaction[], quotes: MarketQuote[]) {
  const quoteMap = useMemo(() => new Map(quotes.map((quote) => [quote.symbol, quote])), [quotes]);
  const positions = useMemo<PositionRow[]>(() => assets.map((asset) => {
    const quote = asset.symbol ? quoteMap.get(asset.symbol) : undefined;
    const marketPrice = positivePrice(quote?.priceToman);
    const manualPrice = positivePrice(asset.manualPriceToman);
    const position = portfolioPosition(asset, transactions, marketPrice ?? manualPrice);
    const priceSource: PositionPriceSource = marketPrice ? "market" : manualPrice ? "manual" : "cost-basis";
    return {
      asset,
      quote,
      ...position,
      priceSource,
      pricingReliable: position.qty <= 0 || priceSource !== "cost-basis",
    };
  }), [assets, transactions, quoteMap]);

  const totals = useMemo(() => ({
    value: positions.reduce((sum, row) => sum + row.currentValue, 0),
    cost: positions.reduce((sum, row) => sum + row.cost, 0),
    targetPct: assets.reduce((sum, asset) => sum + asset.targetPct, 0),
  }), [assets, positions]);

  const allocation = useMemo(() => buildPortfolioAllocation(positions.map((position) => ({
    asset: position.asset,
    currentValue: position.currentValue,
    hasHolding: position.qty > 0,
    pricingReliable: position.pricingReliable,
  }))), [positions]);

  return {
    positions,
    quoteMap,
    allocation,
    totalValue: totals.value,
    totalCost: totals.cost,
    totalPnl: totals.value - totals.cost,
    targetTotal: totals.targetPct,
  };
}
