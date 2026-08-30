import assert from "node:assert/strict";
import test from "node:test";
import { reviewIncomeCorrection } from "../lib/income-correction.ts";
import type { AllocationEntry, IncomeEvent, InvestmentTransaction, PlanItem } from "../lib/types.ts";

const income: IncomeEvent = { id: 1, amountToman: 1_000, title: "ورودی", happenedAt: "2026-08-01", createdAt: "2026-08-01T10:00:00.000Z" };

function plan(id: number, bucket: PlanItem["bucket"], plannedToman: number, executedToman: number, targetType: PlanItem["targetType"] = "bucket"): PlanItem {
  return { id, incomeId: 1, bucket, targetType, label: `برنامه ${id}`, plannedToman, executedToman, createdAt: income.createdAt, updatedAt: income.createdAt };
}

function allocations(values: [number, number, number] = [300, 200, 500]): AllocationEntry[] {
  return ["life", "safety", "growth"].map((bucket, index) => ({ id: index + 1, incomeId: 1, bucket: bucket as AllocationEntry["bucket"], amountToman: values[index], createdAt: income.createdAt }));
}

function linkedBuy(planItemId: number | undefined, amountToman: number): InvestmentTransaction {
  return { id: 1, assetId: 1, type: "buy", amountToman, quantity: 1, unitPriceToman: amountToman, happenedAt: "2026-08-03", incomeId: 1, planItemId, createdAt: "2026-08-03T10:00:00.000Z" };
}

test("income correction never shrinks below already executed money", () => {
  const items = [plan(1, "safety", 400, 400, "fund"), plan(2, "growth", 600, 100, "asset")];
  const review = reviewIncomeCorrection({ income, nextAmountToman: 499, nextHappenedAt: income.happenedAt, planItems: items, allocations: allocations() });
  assert.equal(review.valid, false);
  assert.equal(review.issue, "amount_below_executed");
  assert.equal(review.executedTotal, 500);
});

test("income reduction preserves executed floors and scales only remaining plan money", () => {
  const items = [plan(1, "safety", 400, 400, "fund"), plan(2, "growth", 600, 100, "asset")];
  const review = reviewIncomeCorrection({ income, nextAmountToman: 700, nextHappenedAt: income.happenedAt, planItems: items, allocations: allocations([0, 400, 600]) });
  assert.equal(review.valid, true);
  assert.deepEqual(review.planUpdates, [{ id: 1, plannedToman: 400 }, { id: 2, plannedToman: 300 }]);
  assert.deepEqual(review.allocationTargets, { life: 0, safety: 400, growth: 300 });
  assert.equal(review.plannedTotal, 700);
});

test("fully executed plans stay fixed when the income amount grows", () => {
  const items = [plan(1, "safety", 400, 400, "fund"), plan(2, "growth", 600, 600, "asset")];
  const review = reviewIncomeCorrection({ income, nextAmountToman: 1_200, nextHappenedAt: income.happenedAt, planItems: items, allocations: allocations([0, 400, 600]) });
  assert.equal(review.valid, true);
  assert.equal(review.plannedTotal, 1_000);
  assert.deepEqual(review.planUpdates.map((row) => row.plannedToman), [400, 600]);
});

test("income date is locked after any execution has started", () => {
  const review = reviewIncomeCorrection({ income, nextAmountToman: 1_000, nextHappenedAt: "2026-07-20", planItems: [plan(1, "life", 1_000, 100)], allocations: allocations([1_000, 0, 0]) });
  assert.equal(review.valid, false);
  assert.equal(review.issue, "date_locked_after_execution");
  assert.equal(review.dateLocked, true);
});

test("income date can move while nothing has been executed", () => {
  const review = reviewIncomeCorrection({ income, nextAmountToman: 1_000, nextHappenedAt: "2026-07-20", planItems: [plan(1, "life", 1_000, 0)], allocations: allocations([1_000, 0, 0]) });
  assert.equal(review.valid, true);
  assert.equal(review.dateLocked, false);
});

test("linked investment buys provide an execution floor even if plan progress is stale", () => {
  const items = [plan(1, "growth", 500, 0, "asset"), plan(2, "life", 500, 0)];
  const review = reviewIncomeCorrection({ income, nextAmountToman: 250, nextHappenedAt: income.happenedAt, planItems: items, allocations: allocations([500, 0, 500]), linkedTransactions: [linkedBuy(1, 300)] });
  assert.equal(review.valid, false);
  assert.equal(review.executedTotal, 300);
  assert.equal(review.issue, "amount_below_executed");
});

test("income without plan cards keeps allocation proportions and exact integer total", () => {
  const review = reviewIncomeCorrection({ income, nextAmountToman: 333, nextHappenedAt: income.happenedAt, planItems: [], allocations: allocations([300, 200, 500]) });
  assert.equal(review.valid, true);
  assert.equal(Object.values(review.allocationTargets).reduce((sum, value) => sum + value, 0), 333);
  assert.equal(review.allocationUpdates.reduce((sum, row) => sum + row.amountToman, 0), 333);
});
