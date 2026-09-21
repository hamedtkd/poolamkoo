import { buildInvestmentLots } from "./investment-lots.ts";
import type { AllocationRule, Asset, InvestmentTransaction } from "./types.ts";

export function splitIncome(amount: number, rule: AllocationRule) {
  const life = Math.round((amount * rule.lifePct) / 100);
  const safety = Math.round((amount * rule.safetyPct) / 100);
  const growth = Math.max(0, amount - life - safety);
  return { life, safety, growth };
}

export function portfolioPosition(asset: Asset, txs: InvestmentTransaction[], marketPrice?: number) {
  const resolvedMarketPrice = positivePrice(marketPrice) ?? positivePrice(asset.manualPriceToman);
  const summary = asset.id ? buildInvestmentLots(txs, asset.id, resolvedMarketPrice) : {
    lots: [], openQuantity: 0, openCostToman: 0, realizedPnlToman: 0,
    currentValueToman: resolvedMarketPrice === undefined ? undefined : 0,
    unrealizedPnlToman: resolvedMarketPrice === undefined ? undefined : 0,
  };
  const qty = summary.openQuantity;
  const cost = summary.openCostToman;
  const avgPrice = qty > 0 ? cost / qty : 0;
  const valuationAvailable = resolvedMarketPrice !== undefined;
  const price = resolvedMarketPrice ?? avgPrice;
  const currentValue = summary.currentValueToman ?? cost;
  const unrealized = summary.unrealizedPnlToman ?? 0;
  const realized = summary.realizedPnlToman;
  const returnPct = valuationAvailable && cost > 0 ? unrealized / cost * 100 : 0;
  return { qty, cost, avgPrice, price, currentValue, unrealized, realized, returnPct, valuationAvailable };
}

function positivePrice(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

export function emergencyTarget(monthlyEssentialToman: number, months: number) {
  return Math.max(0, monthlyEssentialToman * months);
}

export function futureFocusPercent(safetyPct: number, growthPct: number) {
  return Math.min(100, Math.max(0, Math.round(safetyPct + growthPct)));
}
