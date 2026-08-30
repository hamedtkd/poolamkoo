"use client";

import { useMemo } from "react";
import { portfolioPosition } from "@/lib/calculations";
import { incomePlanProgress } from "@/lib/plan-execution";
import { resolveAssetValuation, type ValuationPriceSource } from "@/lib/market/valuation";
import { buildReportDecisionSnapshot } from "@/lib/report-insights";
import type { AllocationEntry, AllocationRule, Asset, GoalFund, IncomeEvent, InvestmentTransaction, MarketQuote, PlanItem } from "@/lib/types";

export interface PerformanceRow {
  name: string;
  target: number;
  actual: number;
  value: number;
  pnl: number;
  pnlPct: number;
  priceSource: ValuationPriceSource;
  pricingReliable: boolean;
}

export interface PlanAdherenceRow {
  incomeId: number;
  title: string;
  happenedAt: string;
  planned: number;
  executed: number;
  pct: number;
}

export function useReportsData({ incomes, allocations, funds, assets, transactions, quotes, planItems, rule }: {
  incomes: IncomeEvent[];
  allocations: AllocationEntry[];
  funds: GoalFund[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
  planItems?: PlanItem[];
  rule?: AllocationRule;
}) {
  return useMemo(() => {
    const positions = assets.map((asset) => {
      const valuation = resolveAssetValuation(asset, quotes);
      const position = portfolioPosition(asset, transactions, valuation.price);
      return { asset, ...position, priceSource: valuation.source, pricingReliable: position.qty <= 0 || valuation.decisionReady };
    });
    const portfolio = positions.reduce((sum, position) => sum + position.currentValue, 0);
    const performance: PerformanceRow[] = positions.map((position) => ({
      name: position.asset.name,
      target: position.asset.targetPct,
      actual: portfolio ? position.currentValue / portfolio * 100 : 0,
      value: position.currentValue,
      pnl: position.unrealized,
      pnlPct: position.returnPct,
      priceSource: position.priceSource,
      pricingReliable: position.pricingReliable,
    }));
    const pricingIncomplete = positions.some((position) => position.qty > 0 && !position.pricingReliable);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amountToman, 0);
    const totals = {
      life: sumBucket(allocations, "life"),
      safety: sumBucket(allocations, "safety"),
      growth: sumBucket(allocations, "growth"),
    };
    const funded = funds.reduce((sum, fund) => sum + fund.currentToman, 0);
    const target = funds.reduce((sum, fund) => sum + fund.targetToman, 0);
    const invested = pricingIncomplete ? [] : performance.filter((row) => row.value > 0 || Math.abs(row.pnl) > 0);
    const best = [...invested].sort((a, b) => b.pnlPct - a.pnlPct)[0];
    const worst = [...invested].sort((a, b) => a.pnlPct - b.pnlPct)[0];
    const safePlanItems = planItems ?? [];
    const overallPlan = incomePlanProgress(safePlanItems);
    const planRows: PlanAdherenceRow[] = incomes.flatMap((income) => {
      if (!income.id) return [];
      const progress = incomePlanProgress(safePlanItems.filter((item) => item.incomeId === income.id));
      if (progress.planned <= 0) return [];
      return [{ incomeId: income.id, title: income.title, happenedAt: income.happenedAt, ...progress }];
    }).sort((a, b) => b.happenedAt.localeCompare(a.happenedAt));
    const decision = buildReportDecisionSnapshot({
      totalIncome,
      allocations: totals,
      rule,
      planPlanned: overallPlan.planned,
      planExecuted: overallPlan.executed,
      funded,
      fundTarget: target,
    });
    return { performance, pricingIncomplete, totalIncome, totals, funded, target, best, worst, monthly: buildMonthly(incomes, allocations), overallPlan, planRows, decision };
  }, [allocations, assets, funds, incomes, planItems, quotes, rule, transactions]);
}

function sumBucket(allocations: AllocationEntry[], bucket: AllocationEntry["bucket"]) {
  return allocations.filter((row) => row.bucket === bucket).reduce((sum, row) => sum + row.amountToman, 0);
}

function buildMonthly(incomes: IncomeEvent[], allocations: AllocationEntry[]) {
  const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "short" });
  const now = new Date();
  const result: Array<{ month: string; life: number; safety: number; growth: number }> = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    const ids = new Set(incomes.filter((income) => {
      const happenedAt = new Date(income.happenedAt);
      return happenedAt >= start && happenedAt < end;
    }).map((income) => income.id).filter((id): id is number => Boolean(id)));
    const rows = allocations.filter((allocation) => ids.has(allocation.incomeId));
    result.push({ month: formatter.format(start), life: sumBucket(rows, "life"), safety: sumBucket(rows, "safety"), growth: sumBucket(rows, "growth") });
  }
  return result;
}
