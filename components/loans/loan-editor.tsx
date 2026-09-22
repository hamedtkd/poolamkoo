"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { LoanField } from "@/components/loans/loan-form-parts";
import { formatMoney } from "@/lib/format";
import { updateLoan } from "@/lib/loans/store";
import { toPersianUiError } from "@/lib/errors";
import type { AppSettings, GoalFund, Loan } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LoanEditor({ loan, funds, settings }: { loan: Loan; funds: GoalFund[]; settings: AppSettings }) {
  const router = useRouter();
  const [name, setName] = useState(loan.name);
  const [lender, setLender] = useState(loan.lender ?? "");
  const [actualInstallment, setActualInstallment] = useState<number | null>(loan.actualInstallmentToman ?? null);
  const [reserveMonths, setReserveMonths] = useState(loan.reserveTargetMonths);
  const [reserveFundId, setReserveFundId] = useState<number | null>(loan.reserveFundId ?? null);
  const [riskBudget, setRiskBudget] = useState(loan.riskBudgetInstallments ?? 0);
  const [reminders, setReminders] = useState(loan.reminderDays);
  const [notifyBrowser, setNotifyBrowser] = useState(loan.notifyBrowser);
  const [status, setStatus] = useState<Loan["status"]>(loan.status);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!loan.id || !name.trim()) return;
    setBusy(true);
    try {
      const selectedFund = reserveFundId ? funds.find((fund) => fund.id === reserveFundId) : undefined;
      const currentFund = loan.reserveFundId ? funds.find((fund) => fund.id === loan.reserveFundId) : undefined;
      const changedReserve = reserveFundId !== (loan.reserveFundId ?? null);
      if (changedReserve && currentFund && currentFund.currentToman > 0.5) {
        throw new Error("برای تغییر صندوق ذخیره، ابتدا موجودی صندوق فعلی را به شکل قابل ردیابی تسویه کن.");
      }
      if (changedReserve && selectedFund && selectedFund.currentToman > 0.5) {
        throw new Error("برای محاسبه دقیق اثر وام، فقط صندوق خالی را به‌عنوان ذخیره جدید متصل کن.");
      }
      await updateLoan(loan.id, { name: name.trim(), lender: lender.trim() || undefined, actualInstallmentToman: actualInstallment || undefined, reserveTargetMonths: reserveMonths, reserveFundId: reserveFundId || undefined, riskBudgetInstallments: riskBudget || undefined, reminderDays: reminders, notifyBrowser, status });
      toast({ tone: "success", title: "تنظیمات وام ذخیره شد", description: "قبل از ویرایش یک Recovery Snapshot محلی ساخته شد." });
      router.push(`/loans/${loan.id}`);
    } catch (error) { toast({ tone: "error", title: "ویرایش انجام نشد", description: toPersianUiError(error, "اطلاعات را بررسی کن.") }); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-3xl space-y-4"><div><div className="type-caption type-body-strong text-primary">تنظیمات وام</div><h1 className="mt-1 type-page-title">{loan.name}</h1><p className="mt-1 type-body text-muted-foreground">قرارداد پایه را دست‌کاری نمی‌کنیم؛ این صفحه تنظیمات عملیاتی و اتصال ذخیره را ویرایش می‌کند.</p></div><Card><CardHeader><CardTitle>مشخصات و ذخیره</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><LoanField label="نام وام"><Input value={name} onChange={(e) => setName(e.target.value)}/></LoanField><LoanField label="وام‌دهنده"><Input value={lender} onChange={(e) => setLender(e.target.value)}/></LoanField><LoanField label="قسط واقعی بانک" hint="اختیاری"><MoneyInput value={actualInstallment} onValueChange={setActualInstallment} unit={settings.displayUnit}/></LoanField><LoanField label="هدف ذخیره"><Select value={String(reserveMonths)} onValueChange={(v) => setReserveMonths(Number(v))} options={[3,6,9,12].map((n) => ({ value: String(n), label: `${n.toLocaleString("fa-IR")} قسط` }))}/></LoanField><LoanField label="صندوق ذخیره" hint="صندوق فعلی قابل نگهداری است؛ برای تغییر، فقط صندوق خالی قابل اتصال است."><Select value={reserveFundId ? String(reserveFundId) : "none"} onValueChange={(v) => setReserveFundId(v === "none" ? null : Number(v))} options={[{ value: "none", label: "بدون صندوق متصل" }, ...funds.filter((fund) => fund.id && (fund.id === loan.reserveFundId || fund.currentToman <= 0.5)).map((fund) => ({ value: String(fund.id), label: `${fund.name} · ${formatMoney(fund.currentToman, settings.displayUnit, true)}` }))]}/></LoanField><LoanField label="بودجه زیان"><Select value={String(riskBudget)} onValueChange={(v) => setRiskBudget(Number(v))} options={[{ value: "0", label: "خاموش" }, ...[1,2,3].map((n) => ({ value: String(n), label: `${n.toLocaleString("fa-IR")} قسط` }))]}/></LoanField><LoanField label="وضعیت"><Select value={status} onValueChange={(v) => setStatus(v as Loan["status"])} options={[{ value: "active", label: "فعال" }, { value: "closed", label: "بسته / پایان‌یافته" }]}/></LoanField></CardContent></Card><Card><CardHeader><CardTitle>یادآوری</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[7,3,1,0].map((day) => { const active = reminders.includes(day); return <button type="button" key={day} onClick={() => setReminders(active ? reminders.filter((x) => x !== day) : [...reminders, day].sort((a,b)=>b-a))} className={cn("min-h-11 rounded-xl border px-3 type-caption type-body-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active && "border-primary bg-primary/8 text-primary")}>{day === 0 ? "روز سررسید" : `${day} روز قبل`}</button>; })}</div><div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/20 p-3"><div><div className="type-label">اعلان مرورگر</div><p className="mt-1 type-caption text-muted-foreground">این گزینه فقط ترجیح تو را ذخیره می‌کند. اجازه Notification هنگام فعال‌شدن موتور پایش درخواست می‌شود.</p></div><Switch checked={notifyBrowser} onCheckedChange={setNotifyBrowser}/></div></CardContent></Card><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><Button variant="outline" onClick={() => router.back()}>انصراف</Button><Button onClick={() => void save()} disabled={busy}>{busy ? "در حال ذخیره..." : "ذخیره تغییرات"}</Button></div></div>;
}
