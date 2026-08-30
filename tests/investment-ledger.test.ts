import assert from "node:assert/strict";
import test from "node:test";
import {
  availableQuantityOnDate,
  validateInvestmentLedger,
  validateTransactionChange,
} from "../lib/investment-ledger.ts";
import type { InvestmentTransaction } from "../lib/types.ts";

function tx(overrides: Partial<InvestmentTransaction> & Pick<InvestmentTransaction, "id" | "type" | "quantity" | "happenedAt">): InvestmentTransaction {
  return {
    assetId: 1,
    amountToman: overrides.quantity * 100,
    unitPriceToman: 100,
    createdAt: `${overrides.happenedAt}T12:00:00.000Z`,
    ...overrides,
  };
}

test("historical ledger rejects a sell before enough quantity existed", () => {
  const rows = [
    tx({ id: 1, type: "sell", quantity: 2, happenedAt: "2026-01-01" }),
    tx({ id: 2, type: "buy", quantity: 3, happenedAt: "2026-01-02" }),
  ];
  const result = validateInvestmentLedger(rows);
  assert.equal(result.valid, false);
  assert.equal(result.violation?.transactionId, 1);
});

test("editing an old buy cannot invalidate a later sell", () => {
  const rows = [
    tx({ id: 1, type: "buy", quantity: 5, happenedAt: "2026-01-01" }),
    tx({ id: 2, type: "sell", quantity: 4, happenedAt: "2026-02-01" }),
  ];
  const edited = tx({ id: 1, type: "buy", quantity: 3, happenedAt: "2026-01-01" });
  const result = validateTransactionChange(rows, edited, 1);
  assert.equal(result.valid, false);
  assert.equal(result.violation?.transactionId, 2);
});

test("editing excludes the original row instead of double counting it", () => {
  const rows = [
    tx({ id: 1, type: "buy", quantity: 5, happenedAt: "2026-01-01" }),
    tx({ id: 2, type: "sell", quantity: 4, happenedAt: "2026-02-01" }),
  ];
  const edited = tx({ id: 1, type: "buy", quantity: 4, happenedAt: "2026-01-01" });
  assert.equal(validateTransactionChange(rows, edited, 1).valid, true);
});

test("same-day buys are available to same-day sells because only a date is stored", () => {
  const rows = [
    tx({ id: 2, type: "sell", quantity: 2, happenedAt: "2026-01-01" }),
    tx({ id: 1, type: "buy", quantity: 2, happenedAt: "2026-01-01" }),
  ];
  assert.equal(validateInvestmentLedger(rows).valid, true);
});

test("available quantity on a date excludes the transaction being edited", () => {
  const rows = [
    tx({ id: 1, type: "buy", quantity: 5, happenedAt: "2026-01-01" }),
    tx({ id: 2, type: "sell", quantity: 2, happenedAt: "2026-02-01" }),
    tx({ id: 3, type: "buy", quantity: 10, happenedAt: "2026-03-01" }),
  ];
  assert.equal(availableQuantityOnDate(rows, 1, "2026-02-01", 2), 5);
});

test("moving a sell before its funding buy is rejected", () => {
  const rows = [
    tx({ id: 1, type: "buy", quantity: 2, happenedAt: "2026-02-01" }),
    tx({ id: 2, type: "sell", quantity: 1, happenedAt: "2026-03-01" }),
  ];
  const edited = tx({ id: 2, type: "sell", quantity: 1, happenedAt: "2026-01-01" });
  assert.equal(validateTransactionChange(rows, edited, 2).valid, false);
});

test("deleting a buy is unsafe when a later sell depends on it", () => {
  const rows = [
    tx({ id: 1, type: "buy", quantity: 2, happenedAt: "2026-01-01" }),
    tx({ id: 2, type: "sell", quantity: 1, happenedAt: "2026-02-01" }),
  ];
  assert.equal(validateInvestmentLedger(rows.filter((row) => row.id !== 1)).valid, false);
});
