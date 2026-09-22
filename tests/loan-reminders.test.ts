import assert from "node:assert/strict";
import test from "node:test";
import { buildLoanPaymentReminders, loanReminderKey, loanReminderLeadText, loanReminderNotificationMetaKey } from "../lib/loans/reminders.ts";
import type { Loan, LoanPayment } from "../lib/types.ts";

const now = "2026-09-21T00:00:00.000Z";
const loan: Loan = {
  id: 4, name: "وام ودیعه", principalToman: 280_000_000, nominalAnnualRatePct: 23, termMonths: 60,
  disbursedAt: "2026-09-01", firstPaymentAt: "2026-10-01", reserveTargetMonths: 6,
  reminderDays: [7, 3, 1, 0], notifyBrowser: true, status: "active", createdAt: now, updatedAt: now,
};

function payment(installmentNo: number, dueAt: string): LoanPayment {
  return {
    id: installmentNo, loanId: 4, installmentNo, dueAt, amountToman: 7_893_332, paidAt: dueAt,
    source: "external", reserveToman: 0, externalToman: 7_893_332, assetSaleToman: 0, createdAt: now, updatedAt: now,
  };
}

test("loan reminder appears only on configured lead days", () => {
  const sevenDays = buildLoanPaymentReminders([loan], [], new Date("2026-09-24T12:00:00Z"));
  assert.equal(sevenDays.length, 1);
  assert.equal(sevenDays[0]?.daysRemaining, 7);
  assert.equal(sevenDays[0]?.key, "loan:4:installment:1:lead:7");
  assert.equal(buildLoanPaymentReminders([loan], [], new Date("2026-09-25T12:00:00Z")).length, 0);
});

test("due and overdue reminders use stable anti-spam keys", () => {
  const due = buildLoanPaymentReminders([loan], [], new Date("2026-10-01T12:00:00Z"))[0]!;
  assert.equal(due.urgency, "due");
  assert.equal(due.key, loanReminderKey(4, 1, 0));
  const overdue = buildLoanPaymentReminders([loan], [], new Date("2026-10-05T12:00:00Z"))[0]!;
  assert.equal(overdue.urgency, "overdue");
  assert.equal(overdue.key, "loan:4:installment:1:overdue");
  assert.match(loanReminderLeadText(overdue), /۴ روز/);
  assert.equal(loanReminderNotificationMetaKey(overdue.key), "loan-reminder-notified:v1:loan:4:installment:1:overdue");
});

test("paid installments move reminder to the next contractual due date", () => {
  const reminders = buildLoanPaymentReminders([loan], [payment(1, "2026-10-01")], new Date("2026-10-29T12:00:00Z"));
  assert.equal(reminders[0]?.installmentNo, 2);
  assert.equal(reminders[0]?.dueAt, "2026-11-01");
  assert.equal(reminders[0]?.daysRemaining, 3);
});

test("closed loans and loans with reminders disabled never produce repayment reminders", () => {
  assert.equal(buildLoanPaymentReminders([{ ...loan, status: "closed" }], [], new Date("2026-10-01T12:00:00Z")).length, 0);
  assert.equal(buildLoanPaymentReminders([{ ...loan, reminderDays: [] }], [], new Date("2026-10-05T12:00:00Z")).length, 0);
});
