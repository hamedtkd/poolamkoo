import type { Loan, LoanPayment } from "../types.ts";
import { nextLoanInstallment } from "./schedule.ts";

export type LoanReminderUrgency = "upcoming" | "due" | "overdue";

export interface LoanPaymentReminder {
  key: string;
  loanId: number;
  loanName: string;
  installmentNo: number;
  dueAt: string;
  daysRemaining: number;
  amountToman: number;
  urgency: LoanReminderUrgency;
  leadDay: number | null;
  notifyBrowser: boolean;
}

export const LOAN_REMINDER_NOTIFICATION_META_PREFIX = "loan-reminder-notified:v1:";

function normalizedLeadDays(days: readonly number[]) {
  return [...new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 90))].sort((a, b) => b - a);
}

export function loanReminderKey(loanId: number, installmentNo: number, daysRemaining: number) {
  const suffix = daysRemaining < 0 ? "overdue" : `lead:${daysRemaining}`;
  return `loan:${loanId}:installment:${installmentNo}:${suffix}`;
}

export function loanReminderNotificationMetaKey(reminderKey: string) {
  return `${LOAN_REMINDER_NOTIFICATION_META_PREFIX}${reminderKey}`;
}

export function buildLoanPaymentReminders(loans: readonly Loan[], payments: readonly LoanPayment[], today = new Date()) {
  const reminders: LoanPaymentReminder[] = [];
  for (const loan of loans) {
    if (!loan.id || loan.status !== "active") continue;
    const next = nextLoanInstallment(loan, payments, today);
    if (!next) continue;
    const leadDays = normalizedLeadDays(loan.reminderDays);
    if (!leadDays.length) continue;
    const configuredLead = leadDays.includes(next.daysRemaining) ? next.daysRemaining : null;
    if (next.daysRemaining >= 0 && configuredLead === null) continue;
    const urgency: LoanReminderUrgency = next.daysRemaining < 0 ? "overdue" : next.daysRemaining === 0 ? "due" : "upcoming";
    reminders.push({
      key: loanReminderKey(loan.id, next.installmentNo, next.daysRemaining),
      loanId: loan.id,
      loanName: loan.name,
      installmentNo: next.installmentNo,
      dueAt: next.dueAt,
      daysRemaining: next.daysRemaining,
      amountToman: next.amountToman,
      urgency,
      leadDay: next.daysRemaining < 0 ? null : configuredLead,
      notifyBrowser: loan.notifyBrowser,
    });
  }
  return reminders.sort((a, b) => a.daysRemaining - b.daysRemaining || a.loanId - b.loanId);
}

export function loanReminderLeadText(reminder: Pick<LoanPaymentReminder, "daysRemaining">) {
  if (reminder.daysRemaining < 0) return `سررسید ${Math.abs(reminder.daysRemaining).toLocaleString("fa-IR")} روز گذشته است`;
  if (reminder.daysRemaining === 0) return "سررسید امروز است";
  if (reminder.daysRemaining === 1) return "سررسید فرداست";
  return `${reminder.daysRemaining.toLocaleString("fa-IR")} روز تا سررسید مانده است`;
}
