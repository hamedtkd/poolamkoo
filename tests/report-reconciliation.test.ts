import assert from "node:assert/strict";
import test from "node:test";
import { buildReportReconciliation } from "../lib/report-reconciliation.ts";
import type { AllocationEntry, FundMovement, IncomeEvent, InvestmentTransaction, PlanItem } from "../lib/types.ts";

const income = (id: number, amountToman = 100): IncomeEvent => ({
  id, amountToman, title: `ورودی ${id}`, happenedAt: `2026-08-${String(id).padStart(2, "0")}`,
  createdAt: `2026-08-${String(id).padStart(2, "0")}T08:00:00.000Z`,
});
const allocation = (incomeId: number, amountToman: number): AllocationEntry => ({ incomeId, bucket: "growth", amountToman, createdAt: "2026-08-01" });
const plan = (incomeId: number, plannedToman: number, executedToman: number): PlanItem => ({
  incomeId, bucket: "growth", targetType: "bucket", label: "رشد", plannedToman, executedToman,
  createdAt: "2026-08-01", updatedAt: "2026-08-01",
});
const fundMove = (type: FundMovement["type"], amountToman: number): FundMovement => ({
  fundId: 1, type, source: type === "opening" ? "opening" : "manual", amountToman,
  happenedAt: "2026-08-01", createdAt: "2026-08-01", updatedAt: "2026-08-01",
});
const tx = (type: InvestmentTransaction["type"], amountToman: number): InvestmentTransaction => ({
  assetId: 1, type, amountToman, quantity: 1, unitPriceToman: amountToman,
  happenedAt: "2026-08-01", createdAt: "2026-08-01",
});

function report(overrides: Partial<Parameters<typeof buildReportReconciliation>[0]> = {}) {
  return buildReportReconciliation({
    incomes: [income(1)],
    allocations: [allocation(1, 100)],
    planItems: [plan(1, 100, 100)],
    fundMovements: [],
    transactions: [],
    ...overrides,
  });
}

test("balanced incoming money reconciles income, allocation, plan and execution", () => {
  const result = report();
  assert.equal(result.rows[0].status, "balanced");
  assert.equal(result.allocationGapToman, 0);
  assert.equal(result.planningGapToman, 0);
  assert.equal(result.executionRemainingToman, 0);
  assert.equal(result.attentionCount, 0);
});

test("unfinished execution is progress, not a structural mismatch", () => {
  const result = report({ planItems: [plan(1, 100, 60)] });
  assert.equal(result.rows[0].status, "in_progress");
  assert.equal(result.rows[0].executionRemainingToman, 40);
  assert.equal(result.executionPct, 60);
  assert.equal(result.attentionCount, 0);
});

test("under allocation and planning mismatch stay visible for review", () => {
  const result = report({ allocations: [allocation(1, 80)], planItems: [plan(1, 70, 30)] });
  assert.equal(result.rows[0].status, "attention");
  assert.equal(result.rows[0].allocationGapToman, 20);
  assert.equal(result.rows[0].planningGapToman, 10);
  assert.equal(result.attentionCount, 1);
});

test("over execution is explicit instead of being hidden by percentage clamping", () => {
  const result = report({ planItems: [plan(1, 100, 125)] });
  assert.equal(result.rows[0].status, "attention");
  assert.equal(result.rows[0].executionOverrunToman, 25);
  assert.equal(result.executionPct, 100);
  assert.equal(result.executionOverrunToman, 25);
});


test("opposite reconciliation gaps never cancel each other into a false healthy summary", () => {
  const result = report({
    incomes: [income(1, 100), income(2, 100)],
    allocations: [allocation(1, 80), allocation(2, 120)],
    planItems: [plan(1, 80, 80), plan(2, 120, 120)],
  });
  assert.equal(result.allocationGapToman, 0);
  assert.equal(result.unallocatedToman, 20);
  assert.equal(result.overallocatedToman, 20);
  assert.equal(result.attentionCount, 2);
});

test("fund flow separates opening balance from period deposits and withdrawals", () => {
  const result = report({ fundMovements: [fundMove("opening", 500), fundMove("deposit", 80), fundMove("withdraw", 30)] });
  assert.deepEqual(result.funds, { deposits: 80, withdrawals: 30, opening: 500, netMovement: 50 });
});

test("investment flow reports buys, sells and net buy flow without calling it profit", () => {
  const result = report({ transactions: [tx("buy", 120), tx("sell", 45)] });
  assert.deepEqual(result.investments, { buys: 120, sells: 45, netBuyFlow: 75 });
});

test("multiple income rows keep their own reconciliation state", () => {
  const result = report({
    incomes: [income(1, 100), income(2, 200)],
    allocations: [allocation(1, 100), allocation(2, 150)],
    planItems: [plan(1, 100, 100), plan(2, 150, 50)],
  });
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].incomeId, 2);
  assert.equal(result.rows[0].status, "attention");
  assert.equal(result.rows[1].status, "balanced");
});

test("invalid and negative numeric values never create NaN or fake negative flow", () => {
  const badIncome = { ...income(1), amountToman: Number.NaN };
  const badAllocation = { ...allocation(1, 1), amountToman: -20 };
  const badPlan = { ...plan(1, 1, 1), plannedToman: Number.POSITIVE_INFINITY, executedToman: -5 };
  const result = report({ incomes: [badIncome], allocations: [badAllocation], planItems: [badPlan], fundMovements: [fundMove("deposit", -50)], transactions: [tx("buy", Number.NaN)] });
  const values = [
    result.incomeTotal, result.allocatedTotal, result.plannedTotal, result.executedTotal,
    result.allocationGapToman, result.unallocatedToman, result.overallocatedToman, result.planningGapToman, result.unplannedToman, result.overplannedToman, result.executionRemainingToman,
    result.allocationCoveragePct, result.planningCoveragePct, result.executionPct,
    result.funds.deposits, result.funds.netMovement, result.investments.buys, result.investments.netBuyFlow,
  ];
  assert.equal(values.every(Number.isFinite), true);
  assert.equal(values.every((value) => value >= 0), true);
});
