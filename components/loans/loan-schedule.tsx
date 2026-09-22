"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { formatMoney, toPersianDate } from "@/lib/format";
import { loanContractInstallment } from "@/lib/loans/calculations";
import { daysUntilDate, loanInstallmentDueAt } from "@/lib/loans/schedule";
import type { AppSettings, Loan, LoanPayment } from "@/lib/types";

export function LoanSchedule({ loan, payments, settings }: { loan: Loan; payments: LoanPayment[]; settings: AppSettings }) {
  const rows = Array.from({ length: loan.termMonths }, (_, index) => index + 1).map((installmentNo) => {
    const payment = payments.find((row) => row.loanId === loan.id && row.installmentNo === installmentNo);
    const dueAt = loanInstallmentDueAt(loan.firstPaymentAt, installmentNo);
    const days = daysUntilDate(dueAt);
    return { installmentNo, payment, dueAt, days };
  });
  const installment = loanContractInstallment(loan);
  return <Card><CardHeader><CardTitle>برنامه بازپرداخت</CardTitle><p className="mt-1 type-caption text-muted-foreground">فقط پرداخت واقعی ثبت می‌شود؛ ردیف‌های آینده از قرارداد محاسبه شده‌اند.</p></CardHeader><CardContent><div className="hidden overflow-hidden rounded-xl border md:block"><div className="grid grid-cols-[.6fr_1fr_1fr_1fr_1.1fr] bg-muted/45 px-3 py-2 type-caption type-body-strong text-muted-foreground"><span>قسط</span><span>سررسید</span><span>مبلغ</span><span>وضعیت</span><span>منبع پرداخت</span></div>{rows.map((row) => <div key={row.installmentNo} className="grid grid-cols-[.6fr_1fr_1fr_1fr_1.1fr] items-center border-t px-3 py-2.5 type-caption"><span>{row.installmentNo.toLocaleString("fa-IR")}</span><span>{toPersianDate(row.dueAt)}</span><SensitiveValue>{formatMoney(row.payment?.amountToman ?? installment, settings.displayUnit, true)}</SensitiveValue><StatusBadge payment={row.payment} days={row.days}/><span className="text-muted-foreground">{row.payment ? sourceLabel(row.payment) : "-"}</span></div>)}</div><div className="space-y-2 md:hidden">{rows.map((row) => <div key={row.installmentNo} className="rounded-2xl border p-3"><div className="flex items-start justify-between gap-3"><div><div className="type-label">قسط {row.installmentNo.toLocaleString("fa-IR")}</div><div className="mt-1 type-caption text-muted-foreground">{toPersianDate(row.dueAt)}</div></div><StatusBadge payment={row.payment} days={row.days}/></div><div className="mt-3 flex items-end justify-between gap-3 border-t pt-3"><div><div className="type-caption text-muted-foreground">مبلغ</div><SensitiveValue className="type-strong">{formatMoney(row.payment?.amountToman ?? installment, settings.displayUnit, true)}</SensitiveValue></div><div className="text-end"><div className="type-caption text-muted-foreground">منبع</div><div className="type-caption type-body-strong">{row.payment ? sourceLabel(row.payment) : "هنوز پرداخت نشده"}</div></div></div></div>)}</div></CardContent></Card>;
}

function StatusBadge({ payment, days }: { payment?: LoanPayment; days: number }) {
  if (payment) return <span className="type-caption type-body-strong text-primary">پرداخت شده</span>;
  if (days < 0) return <span className="type-caption type-body-strong text-destructive">عقب‌افتاده</span>;
  if (days <= 7) return <span className="type-caption type-body-strong text-amber-700 dark:text-amber-300">نزدیک</span>;
  return <span className="type-caption type-body-strong text-muted-foreground">آینده</span>;
}

function sourceLabel(payment: LoanPayment) {
  if (payment.source === "reserve") return "ذخیره اقساط";
  if (payment.source === "external") return "پول شخصی";
  if (payment.source === "asset_sale") return "فروش دارایی";
  return "ترکیبی";
}
