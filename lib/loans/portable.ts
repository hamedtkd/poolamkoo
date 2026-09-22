import type { Asset, FundMovement, GoalFund, InvestmentTransaction, Loan, LoanPayment, LoanRiskAlert } from "../types.ts";
import { normalizeLoanPaymentRecord, normalizeLoanRecord } from "./validation.ts";

const ALERT_KINDS = new Set(["reserve_runway_below", "loss_budget_exceeded", "spread_below", "quote_stale"]);

function objectRows<T>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter((row): row is T => Boolean(row) && typeof row === "object") : [];
}

function integerId(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
}

function requireDate(value: unknown, label: string) {
  if (typeof value !== "string" || !Number.isFinite(new Date(value).getTime())) throw new Error(`${label} معتبر نیست.`);
}

function assertLoanAlert(row: LoanRiskAlert, loanIds: Set<number>, assetIds: Set<number>) {
  if (!integerId(row.id)) throw new Error("هشدار ریسک وام شناسه معتبر ندارد.");
  if (!integerId(row.loanId) || !loanIds.has(row.loanId)) throw new Error("هشدار ریسک به وام معتبری متصل نیست.");
  if (row.assetId !== undefined && (!integerId(row.assetId) || !assetIds.has(row.assetId))) throw new Error("هشدار ریسک به دارایی معتبری متصل نیست.");
  if (!ALERT_KINDS.has(row.kind)) throw new Error("نوع هشدار ریسک وام معتبر نیست.");
  if (typeof row.threshold !== "number" || !Number.isFinite(row.threshold)) throw new Error("آستانه هشدار ریسک وام معتبر نیست.");
  if (row.rearmThreshold !== undefined && (typeof row.rearmThreshold !== "number" || !Number.isFinite(row.rearmThreshold))) throw new Error("آستانه بازآماده‌سازی هشدار معتبر نیست.");
  if (typeof row.enabled !== "boolean" || typeof row.armed !== "boolean" || typeof row.notifyBrowser !== "boolean") throw new Error("وضعیت هشدار ریسک وام معتبر نیست.");
  if (row.lastTriggeredAt !== undefined) requireDate(row.lastTriggeredAt, "زمان آخرین هشدار");
  requireDate(row.createdAt, "زمان ساخت هشدار");
  requireDate(row.updatedAt, "زمان ویرایش هشدار");
}

export function normalizePortableLoanData(data: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...data };
  normalized.loans = Array.isArray(data.loans) ? data.loans : [];
  normalized.loanPayments = Array.isArray(data.loanPayments) ? data.loanPayments : [];
  normalized.loanRiskAlerts = Array.isArray(data.loanRiskAlerts) ? data.loanRiskAlerts : [];
  return normalized;
}

export function assertPortableLoanData(data: Record<string, unknown>) {
  const loans = objectRows<Loan>(data.loans);
  const payments = objectRows<LoanPayment>(data.loanPayments);
  const alerts = objectRows<LoanRiskAlert>(data.loanRiskAlerts);
  if (data.loans !== undefined && !Array.isArray(data.loans)) throw new Error("بخش وام‌های بکاپ معتبر نیست.");
  if (data.loanPayments !== undefined && !Array.isArray(data.loanPayments)) throw new Error("بخش اقساط وام بکاپ معتبر نیست.");
  if (data.loanRiskAlerts !== undefined && !Array.isArray(data.loanRiskAlerts)) throw new Error("بخش هشدارهای وام بکاپ معتبر نیست.");

  const loanIds = new Set<number>();
  for (const row of loans) {
    const id = integerId(row.id);
    if (!id || loanIds.has(id)) throw new Error("وام بکاپ شناسه معتبر و یکتا ندارد.");
    requireDate(row.createdAt, "زمان ثبت وام");
    requireDate(row.updatedAt, "زمان ویرایش وام");
    normalizeLoanRecord(row);
    loanIds.add(id);
  }

  const paymentIds = new Set<number>();
  const paymentKeys = new Set<string>();
  for (const row of payments) {
    const id = integerId(row.id);
    if (!id || paymentIds.has(id)) throw new Error("پرداخت وام شناسه معتبر و یکتا ندارد.");
    const loan = loans.find((item) => item.id === row.loanId);
    if (!loan) throw new Error("پرداخت وام به وام معتبری متصل نیست.");
    requireDate(row.createdAt, "زمان ثبت پرداخت");
    requireDate(row.updatedAt, "زمان ویرایش پرداخت");
    normalizeLoanPaymentRecord(row, loan);
    const key = `${row.loanId}:${row.installmentNo}`;
    if (paymentKeys.has(key)) throw new Error("برای یک شماره قسط بیش از یک پرداخت ثبت شده است.");
    paymentKeys.add(key);
    paymentIds.add(id);
  }

  const funds = objectRows<GoalFund>(data.funds);
  const assets = objectRows<Asset>(data.assets);
  const transactions = objectRows<InvestmentTransaction>(data.transactions);
  const fundMovements = objectRows<FundMovement>(data.fundMovements);
  const fundIds = new Set(funds.map((row) => integerId(row.id)).filter((id): id is number => Boolean(id)));
  const assetIds = new Set(assets.map((row) => integerId(row.id)).filter((id): id is number => Boolean(id)));
  const transactionIds = new Set(transactions.map((row) => integerId(row.id)).filter((id): id is number => Boolean(id)));

  for (const loan of loans) {
    if (loan.reserveFundId !== undefined && !fundIds.has(loan.reserveFundId)) throw new Error("صندوق ذخیره وام در داده بکاپ پیدا نشد.");
  }
  for (const row of transactions) {
    if (row.loanId !== undefined && !loanIds.has(row.loanId)) throw new Error("تراکنش سرمایه‌گذاری به وام معتبری متصل نیست.");
  }
  for (const row of fundMovements) {
    if (row.loanId !== undefined && !loanIds.has(row.loanId)) throw new Error("گردش صندوق به وام معتبری متصل نیست.");
    if (row.loanPaymentId !== undefined && !paymentIds.has(row.loanPaymentId)) throw new Error("گردش صندوق به پرداخت وام معتبری متصل نیست.");
    if (row.source === "loan_payment" && (row.type !== "withdraw" || row.loanId === undefined || row.loanPaymentId === undefined)) {
      throw new Error("گردش پرداخت قسط باید برداشت سیستمی و متصل به وام و پرداخت باشد.");
    }
    if (row.loanPaymentId !== undefined) {
      const payment = payments.find((item) => item.id === row.loanPaymentId);
      if (!payment || row.loanId !== payment.loanId) throw new Error("گردش صندوق با پرداخت وام همخوان نیست.");
    }
  }
  const usedSaleTransactionIds = new Set<number>();
  for (const payment of payments) {
    if (payment.reserveFundMovementId !== undefined) {
      const movement = fundMovements.find((item) => item.id === payment.reserveFundMovementId);
      if (!movement || movement.type !== "withdraw" || movement.source !== "loan_payment") throw new Error("پرداخت وام به برداشت معتبر ذخیره متصل نیست.");
      if (movement.loanId !== payment.loanId || movement.loanPaymentId !== payment.id) throw new Error("برداشت ذخیره با پرداخت وام همخوان نیست.");
      if (Math.abs(movement.amountToman - payment.reserveToman) > 0.5) throw new Error("مبلغ برداشت ذخیره با سهم ذخیره قسط همخوان نیست.");
    }
    for (const txId of payment.saleTransactionIds ?? []) {
      if (!transactionIds.has(txId)) throw new Error("پرداخت وام به تراکنش فروش معتبری متصل نیست.");
      if (usedSaleTransactionIds.has(txId)) throw new Error("یک تراکنش فروش نمی‌تواند برای دو پرداخت وام مصرف شود.");
      const transaction = transactions.find((item) => item.id === txId);
      if (!transaction || transaction.type !== "sell") throw new Error("پرداخت وام باید به تراکنش فروش متصل باشد.");
      if (transaction.loanId !== undefined && transaction.loanId !== payment.loanId) throw new Error("تراکنش فروش به وام دیگری متصل است.");
      usedSaleTransactionIds.add(txId);
    }
  }
  for (const alert of alerts) assertLoanAlert(alert, loanIds, assetIds);
}
