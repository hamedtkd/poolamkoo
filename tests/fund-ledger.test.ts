import assert from "node:assert/strict";
import test from "node:test";
import {
  assertPortableFundLedger,
  fundLedgerAfterDelete,
  fundLedgerAfterUpsert,
  legacyFundOpeningMovement,
  normalizePortableFundLedger,
  reviewFundLedger,
} from "../lib/fund-ledger.ts";
import type { FundMovement, GoalFund } from "../lib/types.ts";

const base = "2026-08-01T10:00:00.000Z";
function movement(id: number, type: FundMovement["type"], amountToman: number, happenedAt: string, source: FundMovement["source"] = "manual"): FundMovement {
  return { id, fundId: 1, type, source, amountToman, happenedAt, createdAt: `${happenedAt}T10:00:00.000Z`, updatedAt: `${happenedAt}T10:00:00.000Z` };
}

test("same-day fund deposits are available before same-day withdrawals", () => {
  const rows = [movement(1, "withdraw", 70, "2026-08-02"), movement(2, "deposit", 100, "2026-08-02")];
  assert.deepEqual(reviewFundLedger(rows), { valid: true, balance: 30, negativeAt: null });
});

test("backdated withdrawal is rejected when the balance did not exist yet", () => {
  const rows = [movement(1, "deposit", 100, "2026-08-05")];
  const next = movement(2, "withdraw", 50, "2026-08-04");
  assert.equal(fundLedgerAfterUpsert(rows, next).valid, false);
});

test("editing an old deposit cannot invalidate a later withdrawal", () => {
  const rows = [movement(1, "deposit", 100, "2026-08-01"), movement(2, "withdraw", 90, "2026-08-02")];
  assert.equal(fundLedgerAfterUpsert(rows, { ...rows[0], amountToman: 80 }).valid, false);
});

test("deleting a deposit is unsafe when a later withdrawal depends on it", () => {
  const rows = [movement(1, "deposit", 100, "2026-08-01"), movement(2, "withdraw", 80, "2026-08-02")];
  assert.equal(fundLedgerAfterDelete(rows, 1).valid, false);
});

test("legacy fund balance becomes one explicit opening ledger movement", () => {
  const fund: GoalFund = { id: 4, name: "قدیمی", targetToman: 1_000, currentToman: 600, icon: "fund", category: "planned", createdAt: base, updatedAt: base };
  const row = legacyFundOpeningMovement(fund);
  assert.equal(row?.fundId, 4);
  assert.equal(row?.type, "opening");
  assert.equal(row?.source, "migration");
  assert.equal(row?.amountToman, 600);
});

test("older portable data without a fund ledger is normalized without changing balance", () => {
  const data = { funds: [{ id: 1, name: "A", targetToman: 1_000, currentToman: 400, icon: "fund", category: "planned", createdAt: base, updatedAt: base }] };
  const normalized = normalizePortableFundLedger(data);
  const rows = normalized.fundMovements as FundMovement[];
  assert.equal(rows.length, 1);
  assert.equal(reviewFundLedger(rows).balance, 400);
});

test("portable fund ledger rejects orphan, negative, and mismatched balances", () => {
  const fund = { id: 1, name: "A", targetToman: 1_000, currentToman: 100, icon: "fund", category: "planned", createdAt: base, updatedAt: base };
  assert.throws(() => assertPortableFundLedger({ funds: [fund], fundMovements: [movement(1, "deposit", 100, "2026-08-01"), { ...movement(2, "withdraw", 200, "2026-08-02") }] }), /موجودی منفی/);
  assert.throws(() => assertPortableFundLedger({ funds: [fund], fundMovements: [{ ...movement(1, "deposit", 100, "2026-08-01"), fundId: 9 }] }), /صندوق معتبری/);
  assert.throws(() => assertPortableFundLedger({ funds: [fund], fundMovements: [movement(1, "deposit", 80, "2026-08-01")] }), /همخوان نیست/);
  assert.throws(() => assertPortableFundLedger({ funds: [fund], fundMovements: [movement(1, "withdraw", 100, "2026-08-01", "plan")] }), /نوع یا منبع/);
});
