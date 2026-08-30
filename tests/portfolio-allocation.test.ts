import assert from "node:assert/strict";
import test from "node:test";
import { ALLOCATION_NEAR_TARGET_TOLERANCE_PCT, buildPortfolioAllocation } from "../lib/portfolio-allocation.ts";
import type { Asset } from "../lib/types.ts";

function asset(id: number, name: string, targetPct: number): Asset {
  return {
    id,
    name,
    kind: "custom",
    targetPct,
    icon: "asset",
    archived: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  };
}

test("normal 100 percent target portfolio exposes current shares and gaps", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 60), currentValue: 700 },
    { asset: asset(2, "ب", 40), currentValue: 300 },
  ]);
  assert.equal(review.targetsValid, true);
  assert.equal(review.totalValue, 1000);
  assert.equal(review.rows[0]?.currentPct, 70);
  assert.equal(review.rows[0]?.gapValue, -100);
  assert.equal(review.rows[1]?.gapValue, 100);
});

test("within one percentage point is near target", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 50), currentValue: 509 },
    { asset: asset(2, "ب", 50), currentValue: 491 },
  ]);
  assert.equal(ALLOCATION_NEAR_TARGET_TOLERANCE_PCT, 1);
  assert.equal(review.rows[0]?.status, "near-target");
  assert.equal(review.rows[1]?.status, "near-target");
});

test("underweight asset is identified", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 70), currentValue: 500 },
    { asset: asset(2, "ب", 30), currentValue: 500 },
  ]);
  assert.equal(review.rows[0]?.status, "underweight");
});

test("overweight asset is identified", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 30), currentValue: 500 },
    { asset: asset(2, "ب", 70), currentValue: 500 },
  ]);
  assert.equal(review.rows[0]?.status, "overweight");
});

test("zero target is explicit and never divides by zero", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "بدون هدف", 0), currentValue: 250 },
    { asset: asset(2, "هدف", 100), currentValue: 750 },
  ]);
  assert.equal(review.rows[0]?.status, "no-target");
  assert.equal(review.rows[0]?.targetValue, 0);
});

test("empty portfolio stays finite and invalid", () => {
  const review = buildPortfolioAllocation([]);
  assert.equal(review.totalValue, 0);
  assert.equal(review.targetsValid, false);
  assert.deepEqual(review.rows, []);
});

test("zero-value portfolio stays finite", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 50), currentValue: 0 },
    { asset: asset(2, "ب", 50), currentValue: 0 },
  ]);
  assert.equal(review.totalValue, 0);
  assert.equal(review.rows[0]?.currentPct, 0);
  assert.equal(review.newMoneyPriorities.length, 0);
});

test("invalid target sum suppresses new-money priorities", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 40), currentValue: 200 },
    { asset: asset(2, "ب", 40), currentValue: 800 },
  ]);
  assert.equal(review.targetsValid, false);
  assert.equal(review.newMoneyPriorities.length, 0);
});

test("new-money gaps sort deterministically by missing target value", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 50), currentValue: 200 },
    { asset: asset(2, "ب", 30), currentValue: 200 },
    { asset: asset(3, "ج", 20), currentValue: 600 },
  ]);
  assert.deepEqual(review.newMoneyPriorities.map((row) => row.asset.id), [1, 2]);
});

test("incomplete held pricing marks review incomplete and suppresses new-money priorities", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", 70), currentValue: 300, hasHolding: true, pricingReliable: false },
    { asset: asset(2, "ب", 30), currentValue: 700, hasHolding: true, pricingReliable: true },
  ]);
  assert.equal(review.pricingIncomplete, true);
  assert.equal(review.rows[0]?.status, "underweight");
  assert.equal(review.newMoneyPriorities.length, 0);
});

test("all allocation outputs remain finite even with invalid numeric inputs", () => {
  const review = buildPortfolioAllocation([
    { asset: asset(1, "الف", Number.NaN), currentValue: Number.POSITIVE_INFINITY, hasHolding: true, pricingReliable: false },
  ]);
  const numbers = [review.totalValue, review.totalTargetPct, ...review.rows.flatMap((row) => [row.currentValue, row.currentPct, row.targetPct, row.targetValue, row.driftPct, row.gapValue])];
  assert.equal(numbers.every(Number.isFinite), true);
});
