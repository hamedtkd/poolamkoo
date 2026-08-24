"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { db } from "@/lib/db";
import { dateToISO, isoToDate } from "@/lib/format";
import type { AppSettings, GoalFund } from "@/lib/types";
import { fundSchema, type FundFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";

interface FundEditorProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  fund: GoalFund | null;
  settings: AppSettings;
  onSaved?: (fund: GoalFund) => void;
}

export function FundEditor({ open, onOpenChange, fund, settings, onSaved }: FundEditorProps) {
  const form = useForm<FundFormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: { name: "", targetToman: undefined, currentToman: 0, dueAt: null, category: "planned" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: fund?.name ?? "",
      targetToman: fund?.targetToman,
      currentToman: fund?.currentToman ?? 0,
      dueAt: isoToDate(fund?.dueAt),
      category: fund?.category ?? "planned",
    });
  }, [form, fund, open]);

  const save = form.handleSubmit(async (values) => {
    const now = new Date().toISOString();
    const payload = {
      name: values.name.trim(),
      targetToman: values.targetToman,
      currentToman: values.currentToman,
      dueAt: values.dueAt ? dateToISO(values.dueAt) : undefined,
      category: values.category,
      icon: fund?.icon ?? "fund",
      updatedAt: now,
    } satisfies Omit<GoalFund, "id" | "createdAt">;

    let saved: GoalFund;
    if (fund?.id) {
      await db.funds.update(fund.id, payload);
      saved = { ...fund, ...payload };
    } else {
      const id = await db.funds.add({ ...payload, createdAt: now });
      saved = { ...payload, id: Number(id), createdAt: now };
    }
    onSaved?.(saved);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fund ? "ویرایش صندوق" : "صندوق جدید"}</DialogTitle>
          <DialogDescription>برای هزینه‌های قابل انتظار مثل درمان، هدیه، بیمه یا سفر یک هدف جدا بساز.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="نام" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="مثلاً دندان‌پزشکی" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Controller name="targetToman" control={form.control} render={({ field, fieldState }) => (
              <Field label="هدف" error={fieldState.error?.message}>
                <MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} />
              </Field>
            )} />
            <Controller name="currentToman" control={form.control} render={({ field, fieldState }) => (
              <Field label="موجودی فعلی" error={fieldState.error?.message}>
                <MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} />
              </Field>
            )} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Controller name="category" control={form.control} render={({ field }) => (
              <Field label="نوع">
                <Select value={field.value} onValueChange={field.onChange} options={[
                  { value: "planned", label: "هزینه پیش‌رو" },
                  { value: "emergency", label: "اضطراری" },
                  { value: "custom", label: "سفارشی" },
                ]} />
              </Field>
            )} />
            <Controller name="dueAt" control={form.control} render={({ field, fieldState }) => (
              <Field label="موعد اختیاری" error={fieldState.error?.message}>
                <DatePicker value={field.value ?? null} onValueChange={field.onChange} placeholder="بدون موعد" />
              </Field>
            )} />
          </div>
          <Button type="submit" className="w-full">{fund ? "ذخیره تغییرات" : "ساخت صندوق"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
