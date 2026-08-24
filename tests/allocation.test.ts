import assert from "node:assert/strict";
import test from "node:test";
import { futureFocusPercent, splitIncome } from "../lib/calculations.ts";
import type { AllocationRule } from "../lib/types.ts";

const rule: AllocationRule = {
  name: "متعادل",
  preset: "balanced",
  lifePct: 30,
  safetyPct: 20,
  growthPct: 50,
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

test("splitIncome always returns concrete numeric buckets", () => {
  const result = splitIncome(20_000_000, rule);
  assert.deepEqual(result, { life: 6_000_000, safety: 4_000_000, growth: 10_000_000 });
  assert.equal(Object.values(result).every(Number.isFinite), true);
});

test("splitIncome preserves the full incoming amount", () => {
  const result = splitIncome(12_345_679, rule);
  assert.equal(result.life + result.safety + result.growth, 12_345_679);
});


test("future focus is the real safety + growth share", () => {
  assert.equal(futureFocusPercent(20, 50), 70);
  assert.equal(futureFocusPercent(20, 65), 85);
});
