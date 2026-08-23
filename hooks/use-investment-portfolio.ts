"use client";

import { useMemo } from "react";
import { portfolioPosition } from "@/lib/calculations";
import type { Asset, InvestmentTransaction, MarketQuote } from "@/lib/types";

export interface PositionRow {
  asset: Asset;
  qty: number;
  cost: number;
  avgPrice: number;
  price: number;
  currentValue: number;
  unrealized: number;
  realized: number;
  returnPct: number;
}

export function useInvestmentPortfolio(assets: Asset[], transactions: InvestmentTransaction[], quotes: MarketQuote[]) {
  const quoteMap = useMemo(() => new Map(quotes.map((quote) => [quote.symbol, quote])), [quotes]);
  const positions = useMemo<PositionRow[]>(() => assets.map((asset) => ({
    asset,
    ...portfolioPosition(asset, transactions, asset.symbol ? quoteMap.get(asset.symbol)?.priceToman : asset.manualPriceToman),
  })), [assets, transactions, quoteMap]);

  const totals = useMemo(() => ({
    value: positions.reduce((sum, row) => sum + row.currentValue, 0),
    cost: positions.reduce((sum, row) => sum + row.cost, 0),
    targetPct: assets.reduce((sum, asset) => sum + asset.targetPct, 0),
  }), [assets, positions]);

  return {
    positions,
    quoteMap,
    totalValue: totals.value,
    totalCost: totals.cost,
    totalPnl: totals.value - totals.cost,
    targetTotal: totals.targetPct,
  };
}
