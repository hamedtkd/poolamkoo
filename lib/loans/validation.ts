import type { Loan, LoanAllocationPlanItem, LoanPayment, LoanPaymentSource, LoanStatus } from "../types.ts";

export const DEFAULT_LOAN_REMINDER_DAYS = [7, 3, 1, 0] as const;
const PAYMENT_EPSILON_TOMAN = 0.5;

function finite(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${label} معتبر نیست.`);
  return value;
}

function positive(value: unknown, label: string) {
  const number = finite(value, label);
  if (number <= 0) throw new Error(`${label} باید بیشتر از صفر باشد.`);
  return number;
}

function nonNegative(value: unknown, label: string) {
  const number = finite(value, label);
  if (number < 0) throw new Error(`${label} نمی‌تواند منفی باشد.`);
  return number;
}

function integer(value: unknown, label: string, min = 0) {
  const number = finite(value, label);
  if (!Number.isInteger(number) || number < min) throw new Error(`${label} معتبر نیست.`);
  return number;
}

function validDate(value: unknown, label: string) {
  if (typeof value !== "string" || !value || !Number.isFinite(new Date(value).getTime())) throw new Error(`${label} معتبر نیست.`);
  return value;
}

function optionalPositive(value: unknown, label: string) {
  if (value === undefined || value === null) return undefined;
  return positive(value, label);
}

function optionalNonNegative(value: unknown, label: string) {
  if (value === undefined || value === null) return undefined;
  return nonNegative(value, label);
}

function optionalId(value: unknown, label: string) {
  if (value === undefined || value === null) return undefined;
  return integer(value, label, 1);
}

function cleanText(value: unknown, label: string, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${label} الزامی است.`);
    return undefined;
  }
  if (typeof value !== "string") throw new Error(`${label} معتبر نیست.`);
  const clean = value.trim();
  if (required && !clean) throw new Error(`${label} الزامی است.`);
  return clean || undefined;
}


function allocationPlan(value: unknown): LoanAllocationPlanItem[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new Error("برنامه تخصیص وام معتبر نیست.");
  const rows = value.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error("برنامه تخصیص وام معتبر نیست.");
    const row = raw as Record<string, unknown>;
    const label = cleanText(row.label, `عنوان تخصیص ${index + 1}`, true)!;
    const amountToman = nonNegative(row.amountToman, `مبلغ تخصیص ${index + 1}`);
    const assetId = optionalId(row.assetId, `دارایی تخصیص ${index + 1}`);
    return { label, amountToman, assetId };
  }).filter((row) => row.amountToman > 0);
  return rows.length ? rows : undefined;
}

function reminderDays(value: unknown) {
  if (!Array.isArray(value)) throw new Error("روزهای یادآوری وام معتبر نیست.");
  const days = value.map((day) => integer(day, "روز یادآوری", 0));
  if (days.some((day) => day > 365)) throw new Error("روز یادآوری نمی‌تواند بیشتر از ۳۶۵ روز باشد.");
  return [...new Set(days)].sort((a, b) => b - a);
}

export function normalizeLoanRecord(input: Omit<Loan, "createdAt" | "updatedAt"> & Partial<Pick<Loan, "createdAt" | "updatedAt">>): Loan {
  const name = cleanText(input.name, "نام وام", true)!;
  const lender = cleanText(input.lender, "وام‌دهنده");
  const principalToman = positive(input.principalToman, "اصل وام");
  const nominalAnnualRatePct = nonNegative(input.nominalAnnualRatePct, "نرخ سالانه وام");
  const termMonths = integer(input.termMonths, "تعداد اقساط", 1);
  if (termMonths > 600) throw new Error("تعداد اقساط بیش از محدوده پشتیبانی‌شده است.");
  const disbursedAt = validDate(input.disbursedAt, "تاریخ دریافت وام");
  const firstPaymentAt = validDate(input.firstPaymentAt, "تاریخ اولین قسط");
  const actualInstallmentToman = optionalPositive(input.actualInstallmentToman, "قسط واقعی");
  const upfrontCostsToman = optionalNonNegative(input.upfrontCostsToman, "هزینه اولیه");
  if ((upfrontCostsToman ?? 0) >= principalToman) throw new Error("هزینه اولیه باید از اصل وام کمتر باشد.");
  const reserveTargetMonths = nonNegative(input.reserveTargetMonths, "ماه‌های ذخیره");
  if (reserveTargetMonths > termMonths) throw new Error("هدف ذخیره نمی‌تواند از کل مدت وام بیشتر باشد.");
  const reserveFundId = optionalId(input.reserveFundId, "شناسه صندوق ذخیره");
  const riskBudgetInstallments = optionalNonNegative(input.riskBudgetInstallments, "بودجه زیان");
  const normalizedAllocationPlan = allocationPlan(input.allocationPlan);
  const status: LoanStatus = input.status;
  if (status !== "active" && status !== "closed") throw new Error("وضعیت وام معتبر نیست.");
  if (typeof input.notifyBrowser !== "boolean") throw new Error("تنظیم اعلان وام معتبر نیست.");
  const now = new Date().toISOString();
  return {
    ...input,
    name,
    lender,
    principalToman,
    nominalAnnualRatePct,
    termMonths,
    disbursedAt,
    firstPaymentAt,
    actualInstallmentToman,
    upfrontCostsToman,
    reserveTargetMonths,
    reserveFundId,
    riskBudgetInstallments,
    allocationPlan: normalizedAllocationPlan,
    reminderDays: reminderDays(input.reminderDays),
    notifyBrowser: input.notifyBrowser,
    status,
    createdAt: input.createdAt ? validDate(input.createdAt, "زمان ثبت وام") : now,
    updatedAt: input.updatedAt ? validDate(input.updatedAt, "زمان ویرایش وام") : now,
  };
}

export function loanPaymentSourceFromParts(parts: { reserveToman: number; externalToman: number; assetSaleToman: number }): LoanPaymentSource {
  const positiveParts = [parts.reserveToman, parts.externalToman, parts.assetSaleToman].filter((value) => value > PAYMENT_EPSILON_TOMAN).length;
  if (positiveParts > 1) return "mixed";
  if (parts.reserveToman > PAYMENT_EPSILON_TOMAN) return "reserve";
  if (parts.externalToman > PAYMENT_EPSILON_TOMAN) return "external";
  if (parts.assetSaleToman > PAYMENT_EPSILON_TOMAN) return "asset_sale";
  throw new Error("منبع پرداخت قسط مشخص نشده است.");
}

export function normalizeLoanPaymentRecord(
  input: Omit<LoanPayment, "createdAt" | "updatedAt"> & Partial<Pick<LoanPayment, "createdAt" | "updatedAt">>,
  loan: Pick<Loan, "id" | "termMonths">,
): LoanPayment {
  const loanId = integer(input.loanId, "شناسه وام", 1);
  if (!loan.id || loanId !== loan.id) throw new Error("پرداخت به وام معتبر متصل نیست.");
  const installmentNo = integer(input.installmentNo, "شماره قسط", 1);
  if (installmentNo > loan.termMonths) throw new Error("شماره قسط از مدت وام بیشتر است.");
  const amountToman = positive(input.amountToman, "مبلغ پرداخت");
  const reserveToman = nonNegative(input.reserveToman, "سهم ذخیره");
  const externalToman = nonNegative(input.externalToman, "سهم پول شخصی");
  const assetSaleToman = nonNegative(input.assetSaleToman, "سهم فروش دارایی");
  const partsTotal = reserveToman + externalToman + assetSaleToman;
  if (Math.abs(partsTotal - amountToman) > PAYMENT_EPSILON_TOMAN) throw new Error("جمع منابع پرداخت با مبلغ قسط همخوان نیست.");
  const source = loanPaymentSourceFromParts({ reserveToman, externalToman, assetSaleToman });
  if (input.source !== source) throw new Error("نوع منبع پرداخت با مبالغ ثبت‌شده همخوان نیست.");
  const saleTransactionIds = input.saleTransactionIds?.map((id) => integer(id, "شناسه فروش دارایی", 1));
  if (assetSaleToman > 0 && (!saleTransactionIds || saleTransactionIds.length === 0)) throw new Error("برای سهم فروش دارایی حداقل یک تراکنش فروش لازم است.");
  if (assetSaleToman === 0 && saleTransactionIds?.length) throw new Error("تراکنش فروش فقط برای پرداخت از محل فروش دارایی مجاز است.");
  if (reserveToman === 0 && input.reserveFundMovementId !== undefined) throw new Error("گردش صندوق فقط برای پرداخت از محل ذخیره مجاز است.");
  const now = new Date().toISOString();
  return {
    ...input,
    loanId,
    installmentNo,
    dueAt: validDate(input.dueAt, "سررسید قسط"),
    amountToman,
    paidAt: validDate(input.paidAt, "تاریخ پرداخت قسط"),
    source,
    reserveToman,
    externalToman,
    assetSaleToman,
    reserveFundMovementId: optionalId(input.reserveFundMovementId, "شناسه گردش صندوق"),
    saleTransactionIds,
    note: cleanText(input.note, "یادداشت"),
    createdAt: input.createdAt ? validDate(input.createdAt, "زمان ثبت پرداخت") : now,
    updatedAt: input.updatedAt ? validDate(input.updatedAt, "زمان ویرایش پرداخت") : now,
  };
}
