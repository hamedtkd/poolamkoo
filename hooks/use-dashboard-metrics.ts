"use client";

import { useMemo } from "react";
import { portfolioPosition } from "@/lib/calculations";
import type { AllocationRule, Asset, GoalFund, IncomeEvent, InvestmentTransaction, MarketQuote } from "@/lib/types";

export function useDashboardMetrics({ rule, incomes, funds, assets, transactions, quotes }: {
  rule?: AllocationRule;
  incomes: IncomeEvent[];
  funds: GoalFund[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
}) {
  return useMemo(() => {
    const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
    const positions = assets.map((asset) => ({
      asset,
      ...portfolioPosition(asset, transactions, asset.symbol ? quoteMap.get(asset.symbol)?.priceToman : asset.manualPriceToman),
    }));
    const portfolio = positions.reduce((sum, position) => sum + position.currentValue, 0);
    const investedCost = positions.reduce((sum, position) => sum + position.cost, 0);
    const pnl = portfolio - investedCost;
    const pnlPct = investedCost > 0 ? pnl / investedCost * 100 : 0;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthRows = incomes.filter((income) => new Date(income.happenedAt) >= monthStart);
    const monthIncome = monthRows.reduce((sum, income) => sum + income.amountToman, 0);
    const emergency = funds.find((fund) => fund.category === "emergency");
    const emergencyPct = emergency?.targetToman ? Math.min(100, emergency.currentToman / emergency.targetToman * 100) : 0;
    const decisionGauge = rule ? Math.round((rule.safetyPct + rule.growthPct) / 85 * 100) : 0;
    return {
      positions,
      portfolio,
      pnl,
      pnlPct,
      monthIncome,
      monthIncomeCount: monthRows.length,
      emergency,
      emergencyPct,
      decisionGauge,
      chartData: makeInvestedSeries(transactions),
    };
  }, [assets, funds, incomes, quotes, rule, transactions]);
}

function makeInvestedSeries(transactions: InvestmentTransaction[]) {
  const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "short" });
  const now = new Date();
  let cumulative = 0;
  const beforeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  for (const transaction of transactions) {
    if (new Date(transaction.happenedAt) < beforeStart) cumulative += transaction.type === "buy" ? transaction.amountToman : -transaction.amountToman;
  }
  const result: Array<{ date: string; value: number }> = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    for (const transaction of transactions) {
      const happenedAt = new Date(transaction.happenedAt);
      if (happenedAt >= start && happenedAt < end) cumulative += transaction.type === "buy" ? transaction.amountToman : -transaction.amountToman;
    }
    result.push({ date: formatter.format(start), value: Math.max(0, Math.round(cumulative)) });
  }
  return result;
}
