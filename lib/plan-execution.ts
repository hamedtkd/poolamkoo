"use client";

import { db } from "@/lib/db";
import type { PlanItem } from "@/lib/types";

export function planRemaining(item: PlanItem) {
  return Math.max(0, item.plannedToman - item.executedToman);
}

export function planProgress(item: PlanItem) {
  if (item.plannedToman <= 0) return 100;
  return Math.min(100, item.executedToman / item.plannedToman * 100);
}

export function incomePlanProgress(items: PlanItem[]) {
  const planned = items.reduce((sum, item) => sum + item.plannedToman, 0);
  const executed = items.reduce((sum, item) => sum + Math.min(item.executedToman, item.plannedToman), 0);
  return { planned, executed, pct: planned > 0 ? executed / planned * 100 : 0 };
}

export async function executeNonInvestmentPlan(item: PlanItem, amountToman: number) {
  if (!item.id || amountToman <= 0) return;
  const amount = Math.min(amountToman, planRemaining(item));
  if (amount <= 0) return;
  const now = new Date().toISOString();
  await db.transaction("rw", db.planItems, db.funds, async () => {
    await db.planItems.update(item.id!, { executedToman: item.executedToman + amount, updatedAt: now });
    if (item.targetType === "fund" && item.targetId) {
      const fund = await db.funds.get(item.targetId);
      if (fund) await db.funds.update(fund.id!, { currentToman: fund.currentToman + amount, updatedAt: now });
    }
  });
}

export async function syncInvestmentPlanItem(planItemId?: number) {
  if (!planItemId) return;
  const item = await db.planItems.get(planItemId);
  if (!item) return;
  const linked = await db.transactions.where("planItemId").equals(planItemId).toArray();
  const executed = linked.filter((tx) => tx.type === "buy").reduce((sum, tx) => sum + tx.amountToman, 0);
  await db.planItems.update(planItemId, { executedToman: executed, updatedAt: new Date().toISOString() });
}

export async function syncIncomeAllocationsFromPlan(incomeId: number) {
  const items = await db.planItems.where("incomeId").equals(incomeId).toArray();
  const rows = await db.allocations.where("incomeId").equals(incomeId).toArray();
  const buckets = ["life", "safety", "growth"] as const;
  const now = new Date().toISOString();
  for (const bucket of buckets) {
    const amountToman = items.filter((item) => item.bucket === bucket).reduce((sum, item) => sum + item.plannedToman, 0);
    const row = rows.find((item) => item.bucket === bucket);
    if (row?.id) await db.allocations.update(row.id, { amountToman });
    else if (amountToman > 0) await db.allocations.add({ incomeId, bucket, amountToman, createdAt: now });
  }
}

export function planStatus(item: PlanItem) {
  if (item.executedToman <= 0) return "pending" as const;
  if (item.executedToman + 1 < item.plannedToman) return "partial" as const;
  return "done" as const;
}
