"use client";

import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { useIncomeEditor } from "@/hooks/use-income-editor";
import { formatMoney } from "@/lib/format";
import type { AppSettings, IncomeEvent, PlanItem } from "@/lib/types";

export function IncomeEditDialog({ editing, planItems, settings, onClose }: { editing: IncomeEvent | null; planItems: PlanItem[]; settings: AppSettings; onClose: () => void }) {
  const { form, save, dateLocked, recordedExecuted } = useIncomeEditor(editing, planItems, onClose);
  const integrityError = form.formState.errors.root?.integrity?.message;
  return <Dialog open={!!editing} onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>ویرایش پول ورودی</DialogTitle><DialogDescription>مبلغ اصلاح‌شده فقط بخش اجرا‌نشده برنامه را مقیاس می‌کند؛ پولی که واقعاً اجرا شده دست‌نخورده می‌ماند.</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-4"><Controller name="amount" control={form.control} render={({ field, fieldState }) => <Field label="مبلغ" error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={(value) => { form.clearErrors("root.integrity"); field.onChange(value); }} unit={settings.displayUnit} min={recordedExecuted} /></Field>} />{recordedExecuted > 0 && <p className="rounded-xl border bg-muted/35 px-3 py-2 type-caption text-muted-foreground">تا اینجا <strong className="text-foreground">{formatMoney(recordedExecuted, settings.displayUnit)}</strong> از این ورودی اجرا شده و مبلغ جدید نمی‌تواند از آن کمتر باشد.</p>}<Field label="عنوان" error={form.formState.errors.title?.message}><Input {...form.register("title")} /></Field><Controller name="date" control={form.control} render={({ field, fieldState }) => <Field label="تاریخ" error={fieldState.error?.message}><DatePicker value={field.value} disabled={dateLocked} onValueChange={(date) => { if (date) { form.clearErrors("root.integrity"); field.onChange(date); } }} /></Field>} />{dateLocked && <p className="type-caption text-muted-foreground">بعد از شروع اجرای برنامه، تاریخ این ورودی برای حفظ ترتیب تاریخی قفل می‌شود.</p>}{integrityError && <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{integrityError}</p>}<Button type="submit" className="w-full">ذخیره تغییرات</Button></form></DialogContent></Dialog>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>; }
