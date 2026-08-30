import { portfolioPosition } from "./calculations.ts";
import { resolveAssetValuation } from "./market/valuation.ts";
import type { Asset, GoalFund, InvestmentTransaction, MarketQuote } from "./types.ts";

export function buildSafetyPlan(amountToman: number, funds: GoalFund[]) {
  if (amountToman <= 0) return [] as Array<{ fund: GoalFund; amountToman: number }>;
  const openFunds = funds.filter((fund) => fund.targetToman > fund.currentToman);
  if (!openFunds.length) return [] as Array<{ fund: GoalFund; amountToman: number }>;

  const now = Date.now();
  const urgent = openFunds
    .filter((fund) => fund.category !== "emergency" && fund.dueAt && new Date(fund.dueAt).getTime() - now <= 60 * 86_400_000)
    .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
  const emergency = openFunds.find((fund) => fund.category === "emergency");
  const others = openFunds.filter((fund) => fund !== emergency && !urgent.includes(fund));

  let remaining = amountToman;
  const result: Array<{ fund: GoalFund; amountToman: number }> = [];
  let urgentRemaining = Math.min(remaining, Math.round(amountToman * 0.4));

  for (const fund of urgent) {
    if (urgentRemaining <= 0) break;
    const take = Math.min(fund.targetToman - fund.currentToman, urgentRemaining);
    if (take > 0) result.push({ fund, amountToman: take });
    urgentRemaining -= take;
    remaining -= take;
  }

  if (emergency && remaining > 0) {
    const take = Math.min(emergency.targetToman - emergency.currentToman, remaining);
    if (take > 0) result.push({ fund: emergency, amountToman: take });
    remaining -= take;
  }

  for (const fund of [...urgent, ...others]) {
    if (remaining <= 0) break;
    const existing = result.find((item) => item.fund.id === fund.id);
    const gap = Math.max(0, fund.targetToman - fund.currentToman - (existing?.amountToman ?? 0));
    const take = Math.min(gap, remaining);
    if (take <= 0) continue;
    if (existing) existing.amountToman += take;
    else result.push({ fund, amountToman: take });
    remaining -= take;
  }
  return result;
}

export function growthPlanPricingReady(assets: Asset[], transactions: InvestmentTransaction[], quotes: MarketQuote[]) {
  return growthRows(assets, transactions, quotes).pricingReady;
}

export function buildGrowthPlan(amountToman: number, assets: Asset[], transactions: InvestmentTransaction[], quotes: MarketQuote[]) {
  if (amountToman <= 0) return [] as Array<{ asset: Asset; amountToman: number; normalizedTargetPct: number }>;
  const { rows, pricingReady, targetSum } = growthRows(assets, transactions, quotes);
  if (!rows.length || targetSum <= 0 || !pricingReady) return [] as Array<{ asset: Asset; amountToman: number; normalizedTargetPct: number }>;

  const currentTotal = rows.reduce((sum, row) => sum + row.currentValue, 0);
  const futureTotal = currentTotal + amountToman;
  const withDeficit = rows.map((row) => ({ ...row, deficit: Math.max(0, futureTotal * row.normalized - row.currentValue) }));
  const deficitTotal = withDeficit.reduce((sum, row) => sum + row.deficit, 0);
  const raw = withDeficit.map((row) => deficitTotal >= amountToman && deficitTotal > 0
    ? amountToman * (row.deficit / deficitTotal)
    : row.deficit + Math.max(0, amountToman - deficitTotal) * row.normalized);
  const rounded = raw.map((value) => Math.max(0, Math.round(value)));
  if (rounded.length) rounded[rounded.length - 1] += Math.round(amountToman - rounded.reduce((sum, value) => sum + value, 0));
  return withDeficit.map((row, index) => ({ asset: row.asset, amountToman: rounded[index], normalizedTargetPct: row.normalized * 100 })).filter((row) => row.amountToman > 0);
}

function growthRows(assets: Asset[], transactions: InvestmentTransaction[], quotes: MarketQuote[]) {
  const targets = assets.filter((asset) => !asset.archived && asset.targetPct > 0);
  const targetSum = targets.reduce((sum, asset) => sum + asset.targetPct, 0);
  const rows = targets.map((asset) => {
    const valuation = resolveAssetValuation(asset, quotes);
    const position = portfolioPosition(asset, transactions, valuation.price);
    return {
      asset,
      currentValue: position.currentValue,
      normalized: targetSum > 0 ? asset.targetPct / targetSum : 0,
      decisionReady: position.qty <= 0 || valuation.decisionReady,
    };
  });
  return { rows, targetSum, pricingReady: rows.every((row) => row.decisionReady) };
}
