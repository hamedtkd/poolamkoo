"use client";

import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { useIncomeEditor } from "@/hooks/use-income-editor";
import type { AllocationEntry, AppSettings, IncomeEvent, PlanItem } from "@/lib/types";

export function IncomeEditDialog({ editing, allocations, planItems, settings, onClose }: { editing: IncomeEvent | null; allocations: AllocationEntry[]; planItems: PlanItem[]; settings: AppSettings; onClose: () => void }) {
  const { form, save } = useIncomeEditor(editing, allocations, planItems, onClose);
  return <Dialog open={!!editing} onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>ویرایش پول ورودی</DialogTitle><DialogDescription>مبلغ، عنوان یا تاریخ را اصلاح کن. تقسیم قبلی متناسب با مبلغ جدید مقیاس می‌شود.</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-4"><Controller name="amount" control={form.control} render={({ field, fieldState }) => <Field label="مبلغ" error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} /></Field>} /><Field label="عنوان" error={form.formState.errors.title?.message}><Input {...form.register("title")} /></Field><Controller name="date" control={form.control} render={({ field, fieldState }) => <Field label="تاریخ" error={fieldState.error?.message}><DatePicker value={field.value} onValueChange={(date) => date && field.onChange(date)} /></Field>} /><Button type="submit" className="w-full">ذخیره تغییرات</Button></form></DialogContent></Dialog>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-2"><label className="text-sm font-bold">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>; }
