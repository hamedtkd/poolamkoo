import type { Loan, LoanPayment } from "../types.ts";
import { nextLoanInstallment } from "../loans/schedule.ts";
import { loanReminderKey } from "../loans/reminders.ts";
import type { RemoteLoanReminder } from "./types.ts";

const MAX_REMOTE_LOAN_REMINDERS = 20;
const MAX_SENT_KEYS = 16;

function validTimeZone(value: string) {
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date()); return value; }
  catch { return "UTC"; }
}

function normalizedLeadDays(days: readonly number[]) {
  return [...new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 90))].sort((a, b) => b - a);
}

export function browserTimeZone() {
  if (typeof Intl === "undefined") return "UTC";
  return validTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
}

export function toRemoteLoanReminders(loans: readonly Loan[], payments: readonly LoanPayment[], timeZone = browserTimeZone()): RemoteLoanReminder[] {
  return loans
    .filter((loan): loan is Loan & { id: number } => Boolean(loan.id && loan.status === "active" && loan.notifyBrowser && loan.reminderDays.length))
    .slice(0, MAX_REMOTE_LOAN_REMINDERS)
    .flatMap((loan) => {
      const next = nextLoanInstallment(loan, payments);
      if (!next) return [];
      return [{
        loanId: loan.id,
        installmentNo: next.installmentNo,
        dueAt: next.dueAt,
        reminderDays: normalizedLeadDays(loan.reminderDays),
        timeZone: validTimeZone(timeZone),
        enabled: true,
        sentKeys: [],
        updatedAt: loan.updatedAt,
      }];
    });
}

function reminderIdentity(reminder: Pick<RemoteLoanReminder, "loanId" | "installmentNo">) {
  return `${reminder.loanId}:${reminder.installmentNo}`;
}

export function mergeRemoteLoanReminders(incoming: RemoteLoanReminder[], previous: RemoteLoanReminder[] = []) {
  const prior = new Map(previous.map((reminder) => [reminderIdentity(reminder), reminder]));
  return incoming.map((reminder) => {
    const before = prior.get(reminderIdentity(reminder));
    return { ...reminder, sentKeys: before?.sentKeys.slice(-MAX_SENT_KEYS) ?? [] };
  });
}

function calendarDateParts(now: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: validTimeZone(timeZone), year: "numeric", month: "2-digit", day: "2-digit" });
  const values: Record<string, number> = {};
  for (const part of formatter.formatToParts(now)) if (["year", "month", "day"].includes(part.type)) values[part.type] = Number(part.value);
  return { year: values.year, month: values.month, day: values.day };
}

function dateOnlyUtc(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return Number.NaN;
  return Date.UTC(year, month - 1, day);
}

export function remoteLoanReminderDaysRemaining(reminder: Pick<RemoteLoanReminder, "dueAt" | "timeZone">, now = new Date()) {
  const current = calendarDateParts(now, reminder.timeZone);
  return Math.round((dateOnlyUtc(reminder.dueAt) - Date.UTC(current.year, current.month - 1, current.day)) / 86_400_000);
}

export function remoteLoanReminderEvent(reminder: RemoteLoanReminder, now = new Date()) {
  if (!reminder.enabled) return null;
  const daysRemaining = remoteLoanReminderDaysRemaining(reminder, now);
  if (daysRemaining >= 0 && !reminder.reminderDays.includes(daysRemaining)) return null;
  const key = loanReminderKey(reminder.loanId, reminder.installmentNo, daysRemaining);
  if (reminder.sentKeys.includes(key)) return null;
  return { key, daysRemaining };
}

export function withSentLoanReminder(reminder: RemoteLoanReminder, key: string, updatedAt: string) {
  return { ...reminder, sentKeys: [...reminder.sentKeys.filter((item) => item !== key), key].slice(-MAX_SENT_KEYS), updatedAt };
}
