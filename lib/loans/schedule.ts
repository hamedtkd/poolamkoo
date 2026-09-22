import type { Loan, LoanPayment } from "../types.ts";
import { loanContractInstallment } from "./calculations.ts";

function parseDateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) throw new Error("تاریخ قسط معتبر نیست.");
  return { year, month, day };
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0, 12).getDate();
}

export function addCalendarMonths(value: string, months: number) {
  const { year, month, day } = parseDateOnly(value);
  const baseMonth = month - 1 + months;
  const targetYear = year + Math.floor(baseMonth / 12);
  const targetMonth = ((baseMonth % 12) + 12) % 12;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return [targetYear, targetMonth + 1, targetDay].map((part, index) => String(part).padStart(index ? 2 : 4, "0")).join("-");
}

export function loanInstallmentDueAt(firstPaymentAt: string, installmentNo: number) {
  if (!Number.isInteger(installmentNo) || installmentNo < 1) throw new Error("شماره قسط معتبر نیست.");
  return addCalendarMonths(firstPaymentAt, installmentNo - 1);
}

export function daysUntilDate(value: string, today = new Date()) {
  const { year, month, day } = parseDateOnly(value);
  const target = new Date(year, month - 1, day, 12, 0, 0, 0);
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
  return Math.round((target.getTime() - current.getTime()) / 86_400_000);
}

export function nextLoanInstallment(loan: Loan, payments: readonly LoanPayment[], today = new Date()) {
  const paid = new Set(payments.filter((row) => row.loanId === loan.id).map((row) => row.installmentNo));
  const installmentToman = loanContractInstallment(loan);
  for (let installmentNo = 1; installmentNo <= loan.termMonths; installmentNo += 1) {
    if (paid.has(installmentNo)) continue;
    const dueAt = loanInstallmentDueAt(loan.firstPaymentAt, installmentNo);
    return { installmentNo, dueAt, daysRemaining: daysUntilDate(dueAt, today), amountToman: installmentToman };
  }
  return null;
}

export function paidLoanInstallmentCount(loan: Loan, payments: readonly LoanPayment[]) {
  const valid = payments.filter((row) => row.loanId === loan.id && row.installmentNo >= 1 && row.installmentNo <= loan.termMonths);
  return new Set(valid.map((row) => row.installmentNo)).size;
}
