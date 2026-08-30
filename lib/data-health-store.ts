"use client";

import { auditLocalData, type DataHealthReport } from "@/lib/data-health";
import { db } from "@/lib/db";
import { fundMovementSourceTypeIsValid, reviewFundLedger } from "@/lib/fund-ledger";
import { createRecoverySnapshot } from "@/lib/recovery";
import type { InvestmentTransaction } from "@/lib/types";

const MONEY_EPSILON = 0.5;

function linkedInvestmentExecution(planItemId: number, targetId: number | undefined, incomeId: number, transactions: InvestmentTransaction[]) {
  const linked = transactions.filter((row) => row.planItemId === planItemId);
  const valid = linked.every((row) => row.type === "buy" && row.assetId === targetId && (!row.incomeId || row.incomeId === incomeId)
    && Number.isFinite(row.amountToman) && row.amountToman > 0 && Number.isFinite(row.quantity) && row.quantity > 0
    && Number.isFinite(row.unitPriceToman) && row.unitPriceToman > 0 && Boolean(row.happenedAt && row.createdAt));
  return { count: linked.length, valid, amount: linked.reduce((sum, row) => sum + (Number.isFinite(row.amountToman) ? Math.max(0, row.amountToman) : 0), 0) };
}

export async function readLocalDataHealth(): Promise<DataHealthReport> {
  const [allocationRules, incomes, allocations, funds, fundMovements, assets, transactions, planItems, marketWatchlist, marketAlerts] = await Promise.all([
    db.allocationRules.toArray(),
    db.incomes.toArray(),
    db.allocations.toArray(),
    db.funds.toArray(),
    db.fundMovements.toArray(),
    db.assets.toArray(),
    db.transactions.toArray(),
    db.planItems.toArray(),
    db.marketWatchlist.toArray(),
    db.marketAlerts.toArray(),
  ]);
  return auditLocalData({ allocationRules, incomes, allocations, funds, fundMovements, assets, transactions, planItems, marketWatchlist, marketAlerts });
}

export async function repairSafeLocalDataHealth() {
  const before = await readLocalDataHealth();
  if (!before.repairable) return { report: before, repaired: 0 };
  await createRecoverySnapshot("قبل از ترمیم سلامت داده");
  let repaired = 0;
  await db.transaction("rw", [db.funds, db.fundMovements, db.planItems, db.transactions, db.assets, db.incomes], async () => {
    const [funds, fundMovements, planItems, transactions, assets, incomes] = await Promise.all([
      db.funds.toArray(), db.fundMovements.toArray(), db.planItems.toArray(), db.transactions.toArray(), db.assets.toArray(), db.incomes.toArray(),
    ]);
    const assetIds = new Set(assets.map((row) => row.id).filter((id): id is number => typeof id === "number"));
    const incomeIds = new Set(incomes.map((row) => row.id).filter((id): id is number => typeof id === "number"));
    const now = new Date().toISOString();

    for (const fund of funds) {
      if (!fund.id) continue;
      const rows = fundMovements.filter((row) => row.fundId === fund.id);
      if (!rows.length) continue;
      const validRows = rows.every((row) => Number.isFinite(row.amountToman) && row.amountToman > 0 && fundMovementSourceTypeIsValid(row.type, row.source) && Boolean(row.happenedAt && row.createdAt));
      if (!validRows) continue;
      const review = reviewFundLedger(rows);
      if (!review.valid || Math.abs(review.balance - Math.max(0, fund.currentToman)) <= MONEY_EPSILON) continue;
      await db.funds.update(fund.id, { currentToman: review.balance, updatedAt: now });
      repaired += 1;
    }

    for (const plan of planItems) {
      if (!plan.id || plan.targetType !== "asset" || !plan.targetId || !assetIds.has(plan.targetId) || !incomeIds.has(plan.incomeId)) continue;
      const linked = linkedInvestmentExecution(plan.id, plan.targetId, plan.incomeId, transactions);
      if (!linked.count || !linked.valid) continue;
      const recorded = Number.isFinite(plan.executedToman) ? Math.max(0, plan.executedToman) : 0;
      if (Math.abs(linked.amount - recorded) <= MONEY_EPSILON) continue;
      await db.planItems.update(plan.id, { executedToman: linked.amount, updatedAt: now });
      repaired += 1;
    }
  });
  return { report: await readLocalDataHealth(), repaired };
}
