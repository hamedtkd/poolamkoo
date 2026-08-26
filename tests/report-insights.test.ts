import assert from "node:assert/strict";
import test from "node:test";
import { buildReportDecisionSnapshot } from "../lib/report-insights.ts";

const rule = {
  id: 1, name: "متعادل", preset: "balanced" as const,
  lifePct: 30, safetyPct: 20, growthPct: 50,
  isActive: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
};

function snapshot(overrides: Partial<Parameters<typeof buildReportDecisionSnapshot>[0]> = {}) {
  return buildReportDecisionSnapshot({
    totalIncome: 100,
    allocations: { life: 30, safety: 20, growth: 50 },
    rule,
    planPlanned: 100,
    planExecuted: 90,
    funded: 60,
    fundTarget: 100,
    ...overrides,
  });
}

test("complete report data stays reliable and near the money rule", () => {
  const result = snapshot();
  assert.equal(result.allocationReliable, true);
  assert.equal(result.allocationTargetsValid, true);
  assert.equal(result.largestUnderTarget, undefined);
  assert.equal(result.plan.health, "strong");
  assert.equal(result.funds.pct, 60);
});

test("largest under-target bucket is deterministic", () => {
  const result = snapshot({ allocations: { life: 20, safety: 10, growth: 70 } });
  assert.equal(result.largestUnderTarget?.bucket, "life");
  assert.equal(result.largestUnderTarget?.driftPct, -10);
});

test("partial allocation is marked unreliable and suppresses target guidance", () => {
  const result = snapshot({ totalIncome: 100, allocations: { life: 20, safety: 10, growth: 20 } });
  assert.equal(result.allocationReliable, false);
  assert.equal(result.allocationCoveragePct, 50);
  assert.equal(result.unallocatedToman, 50);
  assert.equal(result.largestUnderTarget, undefined);
});

test("invalid money-rule totals suppress under-target guidance", () => {
  const result = snapshot({ rule: { ...rule, growthPct: 40 } });
  assert.equal(result.allocationTargetsValid, false);
  assert.equal(result.largestUnderTarget, undefined);
});

test("empty period does not invent allocation shares", () => {
  const result = snapshot({ totalIncome: 0, allocations: { life: 0, safety: 0, growth: 0 }, planPlanned: 0, planExecuted: 0 });
  assert.equal(result.allocationCoveragePct, 0);
  assert.equal(result.allocationReliable, false);
  assert.deepEqual(result.buckets.map((row) => row.actualPct), [0, 0, 0]);
  assert.equal(result.plan.health, "empty");
});

test("plan execution is clamped and remaining value cannot become negative", () => {
  const result = snapshot({ planPlanned: 100, planExecuted: 140 });
  assert.equal(result.plan.executed, 100);
  assert.equal(result.plan.pct, 100);
  assert.equal(result.plan.remaining, 0);
});

test("fund coverage is bounded while preserving the real funded amount", () => {
  const result = snapshot({ funded: 150, fundTarget: 100 });
  assert.equal(result.funds.funded, 150);
  assert.equal(result.funds.pct, 100);
  assert.equal(result.funds.remaining, 0);
});

test("all outputs remain finite with invalid numeric inputs", () => {
  const result = snapshot({
    totalIncome: Number.NaN,
    allocations: { life: Number.POSITIVE_INFINITY, safety: -20, growth: Number.NaN },
    planPlanned: Number.NaN,
    planExecuted: Number.POSITIVE_INFINITY,
    funded: Number.NaN,
    fundTarget: Number.NEGATIVE_INFINITY,
  });
  const values = [
    result.totalIncome, result.allocatedTotal, result.unallocatedToman, result.allocationCoveragePct,
    result.plan.planned, result.plan.executed, result.plan.remaining, result.plan.pct,
    result.funds.funded, result.funds.target, result.funds.remaining, result.funds.pct,
    ...result.buckets.flatMap((row) => [row.actualPct, row.targetPct, row.driftPct]),
  ];
  assert.equal(values.every(Number.isFinite), true);
});
