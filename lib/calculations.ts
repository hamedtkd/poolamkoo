import type { AllocationRule, Asset, InvestmentTransaction } from "@/lib/types";

export function splitIncome(amount: number, rule: AllocationRule) {
  const life = Math.round((amount * rule.lifePct) / 100);
  const safety = Math.round((amount * rule.safetyPct) / 100);
  const growth = Math.max(0, amount - life - safety);
  return { life, safety, growth };
}

export function portfolioPosition(asset: Asset, txs: InvestmentTransaction[], marketPrice?: number) {
  const rows = txs.filter((t) => t.assetId === asset.id);
  let qty = 0;
  let cost = 0;
  let realized = 0;
  for (const tx of rows.sort((a, b) => a.happenedAt.localeCompare(b.happenedAt))) {
    if (tx.type === "buy") {
      qty += tx.quantity;
      cost += tx.amountToman;
    } else if (qty > 0) {
      const avg = cost / qty;
      const soldQty = Math.min(qty, tx.quantity);
      const proceeds = tx.quantity > 0 ? tx.amountToman * (soldQty / tx.quantity) : 0;
      realized += proceeds - avg * soldQty;
      qty -= soldQty;
      cost -= avg * soldQty;
    }
  }
  const avgPrice = qty > 0 ? cost / qty : 0;
  const price = marketPrice ?? asset.manualPriceToman ?? avgPrice;
  const currentValue = qty * price;
  const unrealized = currentValue - cost;
  const returnPct = cost > 0 ? (unrealized / cost) * 100 : 0;
  return { qty, cost, avgPrice, price, currentValue, unrealized, realized, returnPct };
}

export function emergencyTarget(monthlyEssentialToman: number, months: number) {
  return Math.max(0, monthlyEssentialToman * months);
}
