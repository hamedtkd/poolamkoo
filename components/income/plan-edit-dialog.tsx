"use client";

import { Controller } from "react-hook-form";
import { RiEdit2Line, RiLockLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { usePlanEditForm } from "@/hooks/use-plan-edit-form";
import { formatMoney } from "@/lib/format";
import type { AppSettings, Asset, GoalFund, IncomeEvent, PlanItem } from "@/lib/types";

const bucketOptions = [
  { value: "life", label: "زندگی" },
  { value: "safety", label: "امنیت" },
  { value: "growth", label: "رشد" },
];

export function PlanEditDialog({
  item,
  onOpenChange,
  settings,
  income,
  planItems,
  assets,
  funds,
}: {
  item: PlanItem | null;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  income?: IncomeEvent;
  planItems: PlanItem[];
  assets: Asset[];
  funds: GoalFund[];
}) {
  const state = usePlanEditForm({ item, open: !!item, onOpenChange, income, planItems, assets, funds });
  const { form } = state;
  const targetType = form.watch("targetType");

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ویرایش کارت برنامه</DialogTitle>
          <DialogDescription>عنوان و مبلغ را اصلاح کن؛ اگر هنوز اجرایی ثبت نشده باشد، نوع و مقصد کارت هم قابل تغییر است.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={state.submit}>
          <div className="rounded-xl bg-muted/45 p-3 type-caption text-muted-foreground">
            سقف این کارت: <span className="type-data text-foreground">{formatMoney(state.maxToman, settings.displayUnit)}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-edit-label">عنوان</Label>
            <Input id="plan-edit-label" {...form.register("label")} aria-invalid={!!form.formState.errors.label} />
            <FieldError message={form.formState.errors.label?.message} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Controller name="bucket" control={form.control} render={({ field }) => (
              <div className="space-y-2"><Label>بخش</Label><Select disabled={state.lockedTarget} value={field.value} onValueChange={field.onChange} options={bucketOptions} /></div>
            )} />
            <Controller name="targetType" control={form.control} render={({ field }) => (
              <div className="space-y-2"><Label>نوع کارت</Label><Select disabled={state.lockedTarget} value={field.value} onValueChange={(value) => { field.onChange(value); form.setValue("targetId", null); }} options={state.targetTypeOptions} /></div>
            )} />
          </div>
          {targetType !== "bucket" && (
            <Controller name="targetId" control={form.control} render={({ field }) => (
              <div className="space-y-2">
                <Label>{targetType === "asset" ? "دارایی" : "صندوق"}</Label>
                <Select disabled={state.lockedTarget} value={field.value ? String(field.value) : undefined} onValueChange={(value) => {
                  field.onChange(Number(value));
                  const selected = state.targetOptions.find((option) => option.value === value);
                  if (selected) form.setValue("label", selected.label, { shouldDirty: true });
                }} placeholder="انتخاب کن" options={state.targetOptions} />
                <FieldError message={form.formState.errors.targetId?.message} />
              </div>
            )} />
          )}
          {state.lockedTarget && <div className="flex items-start gap-2 rounded-xl border bg-muted/35 p-3 type-caption text-muted-foreground"><RiLockLine className="mt-0.5 size-4 shrink-0" /> چون بخشی از این کارت اجرا شده، مقصد آن قفل است؛ عنوان و سقف برنامه هنوز قابل ویرایش‌اند.</div>}
          <Controller name="amount" control={form.control} render={({ field }) => (
            <div className="space-y-2">
              <Label>مبلغ برنامه</Label>
              <MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={!!form.formState.errors.amount} />
              <FieldError message={form.formState.errors.amount?.message} />
            </div>
          )} />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <RiEdit2Line className="size-5" /> ذخیره تغییرات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="type-caption type-body-strong text-destructive">{message}</p> : null;
}
