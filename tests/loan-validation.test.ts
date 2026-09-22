import assert from "node:assert/strict";
import test from "node:test";
import { loanPaymentSourceFromParts, normalizeLoanPaymentRecord, normalizeLoanRecord } from "../lib/loans/validation.ts";

const now = "2026-09-21T00:00:00.000Z";
const loan = normalizeLoanRecord({
  id: 1,
  name: "  وام ودیعه  ",
  lender: " بانک ",
  principalToman: 280_000_000,
  nominalAnnualRatePct: 23,
  termMonths: 60,
  disbursedAt: "2026-09-01",
  firstPaymentAt: "2026-10-01",
  reserveTargetMonths: 6,
  reminderDays: [1, 7, 3, 1, 0],
  notifyBrowser: true,
  status: "active",
  createdAt: now,
  updatedAt: now,
});

test("loan normalization keeps contract data explicit and reminder days deterministic", () => {
  assert.equal(loan.name, "وام ودیعه");
  assert.equal(loan.lender, "بانک");
  assert.deepEqual(loan.reminderDays, [7, 3, 1, 0]);
  assert.equal(loan.reserveTargetMonths, 6);
});

test("payment source is derived from actual contribution parts", () => {
  assert.equal(loanPaymentSourceFromParts({ reserveToman: 10, externalToman: 0, assetSaleToman: 0 }), "reserve");
  assert.equal(loanPaymentSourceFromParts({ reserveToman: 0, externalToman: 10, assetSaleToman: 0 }), "external");
  assert.equal(loanPaymentSourceFromParts({ reserveToman: 0, externalToman: 0, assetSaleToman: 10 }), "asset_sale");
  assert.equal(loanPaymentSourceFromParts({ reserveToman: 5, externalToman: 5, assetSaleToman: 0 }), "mixed");
});

test("loan payment ledger rejects mismatched sources and amounts", () => {
  const base = {
    loanId: 1,
    installmentNo: 1,
    dueAt: "2026-10-01",
    amountToman: 7_900_000,
    paidAt: "2026-10-01",
    source: "external" as const,
    reserveToman: 0,
    externalToman: 7_900_000,
    assetSaleToman: 0,
    createdAt: now,
    updatedAt: now,
  };
  assert.equal(normalizeLoanPaymentRecord(base, loan).source, "external");
  assert.throws(() => normalizeLoanPaymentRecord({ ...base, externalToman: 7_000_000 }, loan), /جمع منابع/);
  assert.throws(() => normalizeLoanPaymentRecord({ ...base, source: "reserve" }, loan), /نوع منبع/);
  assert.throws(() => normalizeLoanPaymentRecord({ ...base, installmentNo: 61 }, loan), /مدت وام/);
});
