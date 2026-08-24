import assert from "node:assert/strict";
import test from "node:test";
import {
  directFundTotal,
  fundsWithDirectBalances,
  remainingAfterDirect,
  validateDirectFundAllocations,
} from "../lib/direct-fund-allocation.ts";
import type { GoalFund } from "../lib/types.ts";

const funds: GoalFund[] = [
  { id: 1, name: "دندان‌پزشکی", targetToman: 20_000_000, currentToman: 2_000_000, icon: "goal", category: "planned", createdAt: "", updatedAt: "" },
  { id: 2, name: "اضطراری", targetToman: 30_000_000, currentToman: 10_000_000, icon: "shield", category: "emergency", createdAt: "", updatedAt: "" },
];

const rows = [{ id: "a", fundId: 1, amountToman: 4_000_000 }];

test("direct fund allocation is removed before percentage planning", () => {
  assert.equal(directFundTotal(rows), 4_000_000);
  assert.equal(remainingAfterDirect(10_000_000, rows), 6_000_000);
});

test("direct allocation is reflected in virtual fund balances", () => {
  const next = fundsWithDirectBalances(funds, rows);
  assert.equal(next[0].currentToman, 6_000_000);
  assert.equal(next[1].currentToman, 10_000_000);
});

test("direct allocation cannot exceed incoming money or target an unknown fund", () => {
  assert.equal(validateDirectFundAllocations(3_000_000, rows, funds).length > 0, true);
  assert.equal(validateDirectFundAllocations(10_000_000, [{ id: "b", fundId: 99, amountToman: 1_000_000 }], funds).length > 0, true);
  assert.equal(validateDirectFundAllocations(10_000_000, rows, funds), "");
});
