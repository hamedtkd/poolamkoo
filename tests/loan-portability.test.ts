import assert from "node:assert/strict";
import test from "node:test";
import { validatePortableData } from "../lib/data-portability.ts";
import { assertPortableLoanData, normalizePortableLoanData } from "../lib/loans/portable.ts";

const now = "2026-09-21T00:00:00.000Z";
const loan = {
  id: 1, name: "وام ودیعه", lender: "بانک", principalToman: 280_000_000, nominalAnnualRatePct: 23, termMonths: 60,
  disbursedAt: "2026-09-01", firstPaymentAt: "2026-10-01", reserveTargetMonths: 6, reserveFundId: 1,
  reminderDays: [7, 3, 1, 0], notifyBrowser: true, status: "active", createdAt: now, updatedAt: now,
};
const payment = {
  id: 1, loanId: 1, installmentNo: 1, dueAt: "2026-10-01", amountToman: 7_900_000, paidAt: "2026-10-01",
  source: "external", reserveToman: 0, externalToman: 7_900_000, assetSaleToman: 0, createdAt: now, updatedAt: now,
};
const alert = {
  id: 1, loanId: 1, assetId: 1, kind: "loss_budget_exceeded", threshold: 2, enabled: true, armed: true,
  notifyBrowser: false, createdAt: now, updatedAt: now,
};

function portable(overrides: Record<string, unknown> = {}) {
  return {
    allocationRules: [], incomes: [], allocations: [], funds: [{ id: 1, currentToman: 0 }], fundMovements: [],
    assets: [{ id: 1 }], transactions: [{ id: 1, loanId: 1 }], settings: [{ id: "settings" }], planItems: [],
    marketWatchlist: [], marketAlerts: [], loans: [loan], loanPayments: [payment], loanRiskAlerts: [alert], ...overrides,
  };
}

test("portable loan data participates in backup preview counts", () => {
  assert.deepEqual(validatePortableData(portable()), {
    incomes: 0, funds: 1, fundMovements: 0, assets: 1, transactions: 1, planItems: 0, watchlist: 0, alerts: 0,
    loans: 1, loanPayments: 1, loanRiskAlerts: 1, total: 6,
  });
});

test("older portable data without loan tables stays compatible", () => {
  const legacy = portable({ loans: undefined, loanPayments: undefined, loanRiskAlerts: undefined, transactions: [] });
  const preview = validatePortableData(legacy);
  assert.equal(preview.loans, 0);
  assert.equal(preview.loanPayments, 0);
  assert.equal(preview.loanRiskAlerts, 0);
  const normalized = normalizePortableLoanData(legacy);
  assert.deepEqual(normalized.loans, []);
  assert.deepEqual(normalized.loanPayments, []);
  assert.deepEqual(normalized.loanRiskAlerts, []);
});

test("portable restore rejects orphan or inconsistent loan references", () => {
  assert.throws(() => validatePortableData(portable({ loans: [] })), /وام معتبری/);
  assert.throws(() => validatePortableData(portable({ loanPayments: [{ ...payment, externalToman: 7_000_000 }] })), /جمع منابع/);
  assert.throws(() => validatePortableData(portable({ loans: [{ ...loan, reserveFundId: 99 }] })), /صندوق ذخیره/);
  assert.throws(() => validatePortableData(portable({ transactions: [{ id: 1, loanId: 99 }] })), /تراکنش سرمایه‌گذاری/);
});


test("portable loan data requires symmetric reserve-payment links", () => {
  const reservePayment = { ...payment, source: "reserve", reserveToman: 7_900_000, externalToman: 0, reserveFundMovementId: 10 };
  const reserveMovement = {
    id: 10, fundId: 1, type: "withdraw", source: "loan_payment", amountToman: 7_900_000, happenedAt: "2026-10-01",
    loanId: 1, loanPaymentId: 1, createdAt: now, updatedAt: now,
  };
  assert.doesNotThrow(() => assertPortableLoanData(portable({ loanPayments: [reservePayment], fundMovements: [reserveMovement] })));
  assert.throws(() => assertPortableLoanData(portable({ loanPayments: [reservePayment], fundMovements: [{ ...reserveMovement, loanPaymentId: 99 }] })), /پرداخت وام معتبری/);
  assert.throws(() => assertPortableLoanData(portable({ loanPayments: [reservePayment], fundMovements: [{ ...reserveMovement, amountToman: 7_000_000 }] })), /مبلغ برداشت ذخیره/);
});

test("portable loan data prevents reusing one sale for multiple installments", () => {
  const sale = { id: 20, assetId: 1, type: "sell", amountToman: 16_000_000, quantity: 1, unitPriceToman: 16_000_000, happenedAt: "2026-10-01", createdAt: now, loanId: 1 };
  const assetPayment = { ...payment, source: "asset_sale", externalToman: 0, assetSaleToman: 7_900_000, saleTransactionIds: [20] };
  const second = { ...assetPayment, id: 2, installmentNo: 2, dueAt: "2026-11-01", paidAt: "2026-11-01" };
  assert.throws(() => assertPortableLoanData(portable({ transactions: [sale], loanPayments: [assetPayment, second] })), /دو پرداخت وام/);
});
