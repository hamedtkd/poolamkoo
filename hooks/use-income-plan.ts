"use client";

import { useMemo } from "react";
import { resolveAssetValuation } from "@/lib/market/valuation";
import { incomePlanProgress } from "@/lib/plan-execution";
import type { Asset, GoalFund, IncomeEvent, MarketQuote, PlanItem } from "@/lib/types";

export function useIncomePlan({ incomeId, incomes, planItems, assets, funds, quotes }: {
  incomeId: number;
  incomes: IncomeEvent[];
  planItems?: PlanItem[];
  assets: Asset[];
  funds: GoalFund[];
  quotes: MarketQuote[];
}) {
  const income = useMemo(() => incomes.find((item) => item.id === incomeId), [incomeId, incomes]);
  const items = useMemo(() => (planItems ?? []).filter((item) => item.incomeId === incomeId), [incomeId, planItems]);
  const progress = useMemo(() => incomePlanProgress(items), [items]);
  const assetMap = useMemo(() => new Map(assets.filter((item) => item.id).map((item) => [item.id!, item])), [assets]);
  const fundMap = useMemo(() => new Map(funds.filter((item) => item.id).map((item) => [item.id!, item])), [funds]);
  const assetPriceMap = useMemo(() => new Map(assets.flatMap((asset) => {
    if (!asset.id) return [];
    const valuation = resolveAssetValuation(asset, quotes);
    return valuation.decisionReady && valuation.price ? [[asset.id, valuation.price] as const] : [];
  })), [assets, quotes]);
  return { income, items, progress, assetMap, fundMap, assetPriceMap };
}
