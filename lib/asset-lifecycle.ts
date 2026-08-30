import { planRemaining } from "./plan-progress.ts";
import type { Asset, InvestmentTransaction, PlanItem } from "./types.ts";

const EPSILON = 1e-10;

export interface AssetArchiveBlockers {
  openQuantity: number;
  pendingPlanCount: number;
  blocked: boolean;
}

export function assetOpenQuantity(transactions: readonly InvestmentTransaction[], assetId: number) {
  const quantity = transactions
    .filter((row) => row.assetId === assetId)
    .reduce((sum, row) => sum + (row.type === "buy" ? safeQuantity(row.quantity) : -safeQuantity(row.quantity)), 0);
  return Math.abs(quantity) <= EPSILON ? 0 : Math.max(0, quantity);
}

export function assetArchiveBlockers(
  assetId: number,
  transactions: readonly InvestmentTransaction[],
  planItems: readonly PlanItem[],
): AssetArchiveBlockers {
  const openQuantity = assetOpenQuantity(transactions, assetId);
  const pendingPlanCount = planItems.filter((item) => (
    item.targetType === "asset" && item.targetId === assetId && planRemaining(item) > 0
  )).length;
  return { openQuantity, pendingPlanCount, blocked: openQuantity > EPSILON || pendingPlanCount > 0 };
}

export function portfolioRelevantAssets(
  assets: readonly Asset[],
  transactions: readonly InvestmentTransaction[],
) {
  return assets.filter((asset) => !asset.archived || (asset.id ? assetOpenQuantity(transactions, asset.id) > EPSILON : false));
}

function safeQuantity(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
