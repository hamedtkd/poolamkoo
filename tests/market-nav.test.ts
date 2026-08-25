import assert from "node:assert/strict";
import test from "node:test";
import { premiumToNavPercent } from "../lib/market/nav.ts";

test("fund premium compares the market price with published NAV", () => {
  assert.equal(premiumToNavPercent(105_000, 100_000), 5);
  assert.equal(premiumToNavPercent(95_000, 100_000), -5);
});

test("fund premium stays unavailable when NAV is missing or invalid", () => {
  assert.equal(premiumToNavPercent(100_000), null);
  assert.equal(premiumToNavPercent(100_000, 0), null);
  assert.equal(premiumToNavPercent(0, 100_000), null);
});
