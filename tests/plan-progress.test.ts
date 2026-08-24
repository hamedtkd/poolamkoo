import assert from "node:assert/strict";
import test from "node:test";
import { incomePlanProgress, planProgress, planRemaining } from "../lib/plan-progress.ts";

test("incomePlanProgress is safe for missing local data", () => {
  assert.deepEqual(incomePlanProgress(undefined), { planned: 0, executed: 0, pct: 0 });
  assert.deepEqual(incomePlanProgress(null), { planned: 0, executed: 0, pct: 0 });
});

test("incomePlanProgress clamps execution to planned amount", () => {
  const result = incomePlanProgress([
    { plannedToman: 4_000_000, executedToman: 5_000_000 },
    { plannedToman: 6_000_000, executedToman: 3_000_000 },
  ]);
  assert.equal(result.planned, 10_000_000);
  assert.equal(result.executed, 7_000_000);
  assert.equal(result.pct, 70);
});

test("plan helpers tolerate incomplete legacy rows", () => {
  assert.equal(planRemaining({ plannedToman: 1_000_000 }), 1_000_000);
  assert.equal(planProgress({ plannedToman: 1_000_000 }), 0);
  assert.equal(planProgress(undefined), 0);
});
