import assert from "node:assert/strict";
import test from "node:test";
import { annualizedMoneyWeightedReturn } from "../lib/loans/returns.ts";
import type { InvestmentTransaction } from "../lib/types.ts";

const buy: InvestmentTransaction = {
  id: 1, assetId: 2, loanId: 3, type: "buy", amountToman: 100_000_000, quantity: 100,
  unitPriceToman: 1_000_000, happenedAt: "2025-09-21", createdAt: "2025-09-21T00:00:00.000Z",
};

test("money-weighted annualized return is comparable with annual loan cost for a simple one-year holding", () => {
  const result = annualizedMoneyWeightedReturn([buy], 110_000_000, "2026-09-21T00:00:00.000Z");
  assert.ok(result);
  assert.ok(Math.abs(result.annualizedReturnPct - 10) < 0.1);
  assert.ok(result.observationDays >= 365);
});

test("annualized return stays unavailable when there is no valid investment cash-flow sign change", () => {
  assert.equal(annualizedMoneyWeightedReturn([], 100_000_000, "2026-09-21T00:00:00.000Z"), null);
});
