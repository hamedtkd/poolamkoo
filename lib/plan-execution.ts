"use client";

import { db } from "@/lib/db";
import { incomePlanProgress, planProgress, planRemaining } from "@/lib/plan-progress";
import type { PlanItem } from "@/lib/types";

export { incomePlanProgress, planProgress, planRemaining };

export async function executeNonInvestmentPlan(item: PlanItem, amountToman: number) {
  if (!item.id || amountToman <= 0) return;
  const amount = Math.min(amountToman, planRemaining(item));
  if (amount <= 0) return;
  const now = new Date().toISOString();
  await db.transaction("rw", db.planItems, db.funds, async () => {
    const currentExecuted = Number.isFinite(item.executedToman) ? item.executedToman : 0;
    await db.planItems.update(item.id!, { executedToman: currentExecuted + amount, updatedAt: now });
    if (item.targetType === "fund" && item.targetId) {
      const fund = await db.funds.get(item.targetId);
      if (fund) await db.funds.update(fund.id!, { currentToman: Math.max(0, fund.currentToman ?? 0) + amount, updatedAt: now });
    }
  });
}

export async function syncInvestmentPlanItem(planItemId?: number) {
  if (!planItemId) return;
  const item = await db.planItems.get(planItemId);
  if (!item) return;
  const linked = await db.transactions.where("planItemId").equals(planItemId).toArray();
  const executed = linked
    .filter((tx) => tx.type === "buy")
    .reduce((sum, tx) => sum + (Number.isFinite(tx.amountToman) ? Math.max(0, tx.amountToman) : 0), 0);
  await db.planItems.update(planItemId, { executedToman: executed, updatedAt: new Date().toISOString() });
}

export async function syncIncomeAllocationsFromPlan(incomeId: number) {
  const items = await db.planItems.where("incomeId").equals(incomeId).toArray();
  const rows = await db.allocations.where("incomeId").equals(incomeId).toArray();
  const buckets = ["life", "safety", "growth"] as const;
  const now = new Date().toISOString();
  for (const bucket of buckets) {
    const amountToman = items
      .filter((item) => item.bucket === bucket)
      .reduce((sum, item) => sum + (Number.isFinite(item.plannedToman) ? Math.max(0, item.plannedToman) : 0), 0);
    const row = rows.find((item) => item.bucket === bucket);
    if (row?.id) await db.allocations.update(row.id, { amountToman });
    else if (amountToman > 0) await db.allocations.add({ incomeId, bucket, amountToman, createdAt: now });
  }
}

export function planStatus(item?: PlanItem | null) {
  if (!item) return "pending" as const;
  const executed = Number.isFinite(item.executedToman) ? Math.max(0, item.executedToman) : 0;
  const planned = Number.isFinite(item.plannedToman) ? Math.max(0, item.plannedToman) : 0;
  if (executed <= 0) return "pending" as const;
  if (executed + 1 < planned) return "partial" as const;
  return "done" as const;
}
