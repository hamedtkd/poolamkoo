"use client";

import { db } from "@/lib/db";
import { createRecoverySnapshot } from "@/lib/recovery";
import type { Loan } from "@/lib/types";
import { DEFAULT_LOAN_REMINDER_DAYS, normalizeLoanRecord } from "@/lib/loans/validation";

export type LoanDraft = Omit<Loan, "id" | "createdAt" | "updatedAt" | "status" | "reminderDays" | "notifyBrowser"> & {
  status?: Loan["status"];
  reminderDays?: Loan["reminderDays"];
  notifyBrowser?: Loan["notifyBrowser"];
};
export type LoanPatch = Partial<Omit<Loan, "id" | "createdAt">>;

async function assertReserveFundExists(reserveFundId?: number) {
  if (reserveFundId === undefined) return;
  if (!await db.funds.get(reserveFundId)) throw new Error("صندوق ذخیره انتخاب‌شده پیدا نشد.");
}

export async function createLoan(input: LoanDraft) {
  await assertReserveFundExists(input.reserveFundId);
  const now = new Date().toISOString();
  const loan = normalizeLoanRecord({
    ...input,
    reminderDays: input.reminderDays ?? [...DEFAULT_LOAN_REMINDER_DAYS],
    notifyBrowser: input.notifyBrowser ?? false,
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  });
  return db.loans.add(loan);
}

export async function getLoan(id: number) {
  return db.loans.get(id);
}

export async function listLoans(status?: Loan["status"]) {
  if (status) return db.loans.where("status").equals(status).sortBy("updatedAt");
  return db.loans.orderBy("updatedAt").reverse().toArray();
}

export async function updateLoan(id: number, patch: LoanPatch) {
  const current = await db.loans.get(id);
  if (!current) throw new Error("وام پیدا نشد.");
  const reserveFundId = "reserveFundId" in patch ? patch.reserveFundId : current.reserveFundId;
  await assertReserveFundExists(reserveFundId);
  const next = normalizeLoanRecord({ ...current, ...patch, id, createdAt: current.createdAt, updatedAt: new Date().toISOString() });
  const payments = await db.loanPayments.where("loanId").equals(id).toArray();
  if (payments.some((row) => row.installmentNo > next.termMonths)) throw new Error("مدت جدید وام با اقساط ثبت‌شده همخوان نیست.");
  await createRecoverySnapshot("قبل از ویرایش وام");
  await db.loans.put(next);
  return next;
}

export async function setLoanStatus(id: number, status: Loan["status"]) {
  return updateLoan(id, { status });
}

export async function deleteLoan(id: number) {
  const loan = await db.loans.get(id);
  if (!loan) throw new Error("وام پیدا نشد.");
  const [paymentCount, linkedTransactions, linkedFundMovements] = await Promise.all([
    db.loanPayments.where("loanId").equals(id).count(),
    db.transactions.filter((row) => row.loanId === id).count(),
    db.fundMovements.filter((row) => row.loanId === id).count(),
  ]);
  if (paymentCount || linkedTransactions || linkedFundMovements) {
    throw new Error("وام دارای سابقه مالی است و قابل حذف نیست. در صورت پایان بازپرداخت، آن را ببند.");
  }
  await createRecoverySnapshot("قبل از حذف وام");
  await db.transaction("rw", db.loans, db.loanRiskAlerts, async () => {
    await db.loanRiskAlerts.where("loanId").equals(id).delete();
    await db.loans.delete(id);
  });
}
