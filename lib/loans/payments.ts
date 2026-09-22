"use client";

import { db } from "@/lib/db";
import { applyFundMovementWithinTransaction } from "@/lib/fund-ledger-store";
import { createRecoverySnapshot } from "@/lib/recovery";
import type { LoanPayment } from "@/lib/types";
import { loanPaymentSourceFromParts, normalizeLoanPaymentRecord } from "@/lib/loans/validation";

export type LoanPaymentDraft = Omit<LoanPayment, "id" | "createdAt" | "updatedAt">;
export type LoanPaymentPatch = Partial<Omit<LoanPayment, "id" | "loanId" | "createdAt">>;
export type LoanPaymentSourceInput = Pick<LoanPayment, "loanId" | "installmentNo" | "dueAt" | "amountToman" | "paidAt" | "reserveToman" | "externalToman" | "assetSaleToman" | "saleTransactionIds" | "note">;
const MONEY_EPSILON = 0.5;

async function assertUniqueInstallment(loanId: number, installmentNo: number, replacingId?: number) {
  const existing = await db.loanPayments.where("[loanId+installmentNo]").equals([loanId, installmentNo]).first();
  if (existing && existing.id !== replacingId) throw new Error("برای این شماره قسط قبلا پرداخت ثبت شده است.");
}

function saleProceeds(row: { amountToman: number; feeToman?: number; otherCostToman?: number }) {
  return Math.max(0, row.amountToman - (row.feeToman ?? 0) - (row.otherCostToman ?? 0));
}

async function assertSaleReferences(payment: Pick<LoanPayment, "loanId" | "assetSaleToman" | "saleTransactionIds">, replacingId?: number) {
  const ids = payment.saleTransactionIds ?? [];
  if (payment.assetSaleToman <= MONEY_EPSILON) return;
  if (!ids.length) throw new Error("برای سهم فروش دارایی حداقل یک تراکنش فروش لازم است.");
  const rows = await db.transactions.bulkGet(ids);
  if (rows.some((row) => !row || row.type !== "sell")) throw new Error("یکی از تراکنش‌های فروش پرداخت معتبر نیست.");
  if (rows.some((row) => row?.loanId !== payment.loanId)) throw new Error("فقط فروش دارایی‌ای که به همین وام متصل است می‌تواند منبع پرداخت وام باشد.");
  const proceeds = rows.reduce((sum, row) => sum + (row ? saleProceeds(row) : 0), 0);
  if (proceeds + MONEY_EPSILON < payment.assetSaleToman) throw new Error("سهم پرداخت از فروش دارایی از وجه فروش انتخاب‌شده بیشتر است.");
  const otherPayments = await db.loanPayments.filter((row) => row.id !== replacingId && Boolean(row.saleTransactionIds?.some((id) => ids.includes(id)))).toArray();
  if (otherPayments.length) throw new Error("یکی از فروش‌های انتخاب‌شده قبلا برای قسط دیگری استفاده شده است.");
}

async function assertPaymentReferences(payment: LoanPayment, replacingId?: number) {
  if (payment.reserveFundMovementId !== undefined) {
    const movement = await db.fundMovements.get(payment.reserveFundMovementId);
    if (!movement || movement.type !== "withdraw") throw new Error("گردش صندوق ذخیره برای این پرداخت معتبر نیست.");
    if (movement.loanId !== payment.loanId) throw new Error("گردش صندوق ذخیره به همین وام متصل نیست.");
    if (Math.abs(movement.amountToman - payment.reserveToman) > MONEY_EPSILON) throw new Error("مبلغ برداشت ذخیره با سهم ذخیره قسط همخوان نیست.");
  }
  await assertSaleReferences(payment, replacingId);
}

export async function recordLoanPayment(input: LoanPaymentDraft) {
  const loan = await db.loans.get(input.loanId);
  if (!loan) throw new Error("وام پرداخت پیدا نشد.");
  if (loan.status !== "active") throw new Error("برای وام بسته‌شده نمی‌توان قسط جدید ثبت کرد.");
  const now = new Date().toISOString();
  const payment = normalizeLoanPaymentRecord({ ...input, createdAt: now, updatedAt: now }, loan);
  await assertUniqueInstallment(payment.loanId, payment.installmentNo);
  await assertPaymentReferences(payment);
  return db.loanPayments.add(payment);
}

export async function recordLoanPaymentFromSources(input: LoanPaymentSourceInput) {
  const loan = await db.loans.get(input.loanId);
  if (!loan) throw new Error("وام پرداخت پیدا نشد.");
  if (loan.status !== "active") throw new Error("برای وام بسته‌شده نمی‌توان قسط جدید ثبت کرد.");
  const source = loanPaymentSourceFromParts(input);
  const now = new Date().toISOString();
  const base = normalizeLoanPaymentRecord({ ...input, source, createdAt: now, updatedAt: now }, loan);
  await assertUniqueInstallment(base.loanId, base.installmentNo);
  await assertSaleReferences(base);

  return db.transaction("rw", db.loans, db.loanPayments, db.funds, db.fundMovements, async () => {
    const paymentId = Number(await db.loanPayments.add(base));
    let reserveFundMovementId: number | undefined;
    if (base.reserveToman > MONEY_EPSILON) {
      if (!loan.reserveFundId) throw new Error("برای این وام صندوق ذخیره متصل نشده است.");
      const movement = await applyFundMovementWithinTransaction({
        fundId: loan.reserveFundId,
        type: "withdraw",
        source: "loan_payment",
        amountToman: base.reserveToman,
        happenedAt: base.paidAt.slice(0, 10),
        note: `پرداخت قسط ${base.installmentNo} وام ${loan.name}`,
        loanId: loan.id,
        loanPaymentId: paymentId,
      });
      reserveFundMovementId = movement.id;
      await db.loanPayments.update(paymentId, { reserveFundMovementId });
    }
    return { ...base, id: paymentId, reserveFundMovementId };
  });
}

export async function updateLoanPayment(id: number, patch: LoanPaymentPatch) {
  const current = await db.loanPayments.get(id);
  if (!current) throw new Error("پرداخت وام پیدا نشد.");
  const loan = await db.loans.get(current.loanId);
  if (!loan) throw new Error("وام پرداخت پیدا نشد.");
  const next = normalizeLoanPaymentRecord({ ...current, ...patch, id, loanId: current.loanId, createdAt: current.createdAt, updatedAt: new Date().toISOString() }, loan);
  await assertUniqueInstallment(next.loanId, next.installmentNo, id);
  await assertPaymentReferences(next, id);
  await createRecoverySnapshot("قبل از ویرایش پرداخت وام");
  await db.loanPayments.put(next);
  return next;
}

export async function deleteLoanPayment(id: number) {
  const payment = await db.loanPayments.get(id);
  if (!payment) throw new Error("پرداخت وام پیدا نشد.");
  const linkedMovement = await db.fundMovements.filter((row) => row.loanPaymentId === id).first();
  if (linkedMovement) throw new Error("این پرداخت به گردش صندوق متصل است. ابتدا ارتباط مالی آن را اصلاح کن.");
  await createRecoverySnapshot("قبل از حذف پرداخت وام");
  await db.loanPayments.delete(id);
}

export async function listLoanPayments(loanId: number) {
  return db.loanPayments.where("loanId").equals(loanId).sortBy("installmentNo");
}

export async function loanPaymentContributionTotals(loanId: number) {
  const rows = await listLoanPayments(loanId);
  return rows.reduce((totals, row) => ({
    paidToman: totals.paidToman + row.amountToman,
    reserveToman: totals.reserveToman + row.reserveToman,
    externalToman: totals.externalToman + row.externalToman,
    assetSaleToman: totals.assetSaleToman + row.assetSaleToman,
  }), { paidToman: 0, reserveToman: 0, externalToman: 0, assetSaleToman: 0 });
}
