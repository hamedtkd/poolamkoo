import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeRemoteLoanReminders,
  remoteLoanReminderEvent,
  toRemoteLoanReminders,
  withSentLoanReminder,
} from "../lib/push/loan-reminders.ts";
import { parseRemoteLoanReminders } from "../lib/push/server-validation.ts";
import type { Loan } from "../lib/types.ts";

const loan: Loan = {
  id: 9, name: "وام شخصی من", lender: "بانک نمونه", principalToman: 365_000_000, nominalAnnualRatePct: 23, termMonths: 60,
  disbursedAt: "2026-09-01", firstPaymentAt: "2026-10-01", actualInstallmentToman: 10_289_522,
  reserveTargetMonths: 6, reminderDays: [7, 3, 1, 0], notifyBrowser: true, status: "active",
  createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-20T00:00:00.000Z",
};

test("remote loan reminder mirror excludes loan name, amount and portfolio data", () => {
  const rows = toRemoteLoanReminders([loan], [], "Asia/Tehran");
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0]?.reminderDays, [7, 3, 1, 0]);
  assert.equal(rows[0]?.timeZone, "Asia/Tehran");
  const serialized = JSON.stringify(rows[0]);
  assert.doesNotMatch(serialized, /وام شخصی من|بانک نمونه|365000000|10289522/);
});

test("server parser rejects invalid reminder dates and normalizes lead days", () => {
  const valid = parseRemoteLoanReminders([{ loanId: 9, installmentNo: 1, dueAt: "2026-10-01", reminderDays: [3, 7, 3, -1], timeZone: "Asia/Tehran", enabled: true, updatedAt: "2026-09-20T00:00:00.000Z" }]);
  assert.deepEqual(valid?.[0]?.reminderDays, [7, 3]);
  assert.equal(parseRemoteLoanReminders([{ loanId: 9, installmentNo: 1, dueAt: "nope", reminderDays: [3], timeZone: "Asia/Tehran", enabled: true, updatedAt: "x" }]), null);
});

test("remote reminder fires on a configured lead day and dedupes after send", () => {
  const reminder = toRemoteLoanReminders([loan], [], "UTC")[0]!;
  const event = remoteLoanReminderEvent(reminder, new Date("2026-09-28T12:00:00Z"));
  assert.equal(event?.daysRemaining, 3);
  assert.equal(event?.key, "loan:9:installment:1:lead:3");
  const sent = withSentLoanReminder(reminder, event!.key, "2026-09-28T12:00:00.000Z");
  assert.equal(remoteLoanReminderEvent(sent, new Date("2026-09-28T15:00:00Z")), null);
});

test("overdue remote reminder fires once with a stable overdue key", () => {
  const reminder = toRemoteLoanReminders([loan], [], "UTC")[0]!;
  const event = remoteLoanReminderEvent(reminder, new Date("2026-10-04T12:00:00Z"));
  assert.equal(event?.key, "loan:9:installment:1:overdue");
  const sent = withSentLoanReminder(reminder, event!.key, "2026-10-04T12:00:00.000Z");
  assert.equal(remoteLoanReminderEvent(sent, new Date("2026-10-10T12:00:00Z")), null);
});

test("remote sent state survives client resync for the same installment and resets for the next", () => {
  const first = toRemoteLoanReminders([loan], [], "UTC")[0]!;
  const previous = withSentLoanReminder(first, "loan:9:installment:1:lead:7", "2026-09-24T00:00:00.000Z");
  const merged = mergeRemoteLoanReminders([first], [previous]);
  assert.deepEqual(merged[0]?.sentKeys, ["loan:9:installment:1:lead:7"]);
  const next = { ...first, installmentNo: 2, dueAt: "2026-11-01" };
  assert.deepEqual(mergeRemoteLoanReminders([next], [previous])[0]?.sentKeys, []);
});
