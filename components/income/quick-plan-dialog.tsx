"use client";

import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { RiAddLine } from "react-icons/ri";
import { AssetDialog } from "@/components/investments/asset-dialog";
import { FundEditor } from "@/components/funds/fund-editor";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { RelatedEntitySelect } from "@/components/ui/related-entity-select";
import { Select } from "@/components/ui/select";
import { useQuickPlanForm } from "@/hooks/use-quick-plan-form";
import { formatMoney } from "@/lib/format";
import type { AppSettings, Asset, GoalFund, IncomeEvent, PlanItem } from "@/lib/types";

const bucketOptions = [
  { value: "life", label: "زندگی" },
  { value: "safety", label: "امنیت" },
  { value: "growth", label: "رشد" },
];

export function QuickPlanDialog({ open, onOpenChange, settings, income, planItems, assets, funds, initialBucket = "growth" }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  income?: IncomeEvent;
  planItems: PlanItem[];
  assets: Asset[];
  funds: GoalFund[];
  initialBucket?: "life" | "safety" | "growth";
}) {
  const [fundEditorOpen, setFundEditorOpen] = useState(false);
  const [assetEditorOpen, setAssetEditorOpen] = useState(false);
  const state = useQuickPlanForm({ open, onOpenChange, income, planItems, assets, funds, initialBucket });
  const { form } = state;
  const targetType = useWatch({ control: form.control, name: "targetType" }) ?? "bucket";

  function selectCreatedTarget(id: number, label: string) {
    form.setValue("targetId", id, { shouldDirty: true, shouldValidate: true });
    form.setValue("label", label, { shouldDirty: true });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>کارت سریع برنامه</DialogTitle>
            <DialogDescription>از مبلغ آزاد همین پول، یک هدف جدید بساز. اگر مقصد هنوز وجود ندارد، همان‌جا صندوق یا دارایی را بساز.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={state.submit}>
            <div className="rounded-xl bg-muted/45 p-3 type-caption text-muted-foreground">مبلغ آزاد: <strong className="text-foreground">{formatMoney(state.availableToman, settings.displayUnit)}</strong></div>
            <div className="space-y-2">
              <Label htmlFor="quick-plan-label">عنوان</Label>
              <Input id="quick-plan-label" {...form.register("label")} aria-invalid={!!form.formState.errors.label} />
              <FieldError message={form.formState.errors.label?.message} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Controller name="bucket" control={form.control} render={({ field }) => <div className="space-y-2"><Label>بخش</Label><Select value={field.value} onValueChange={field.onChange} options={bucketOptions} /></div>} />
              <Controller name="targetType" control={form.control} render={({ field }) => <div className="space-y-2"><Label>نوع کارت</Label><Select value={field.value} onValueChange={(value) => { field.onChange(value); form.setValue("targetId", null); }} options={state.targetTypeOptions} /></div>} />
            </div>
            {targetType !== "bucket" && <Controller name="targetId" control={form.control} render={({ field }) => (
              <div className="space-y-2">
                <Label>{targetType === "asset" ? "دارایی" : "صندوق"}</Label>
                <RelatedEntitySelect
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                    const selected = state.targetOptions.find((option) => option.value === value);
                    if (selected) form.setValue("label", selected.label, { shouldDirty: true });
                  }}
                  placeholder="انتخاب کن"
                  options={state.targetOptions}
                  createLabel={targetType === "asset" ? "دارایی جدید" : "صندوق جدید"}
                  onCreate={() => targetType === "asset" ? setAssetEditorOpen(true) : setFundEditorOpen(true)}
                />
                <FieldError message={form.formState.errors.targetId?.message} />
              </div>
            )} />}
            <Controller name="amount" control={form.control} render={({ field }) => (
              <div className="space-y-2"><Label>مبلغ برنامه</Label><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={!!form.formState.errors.amount} /><FieldError message={form.formState.errors.amount?.message} /></div>
            )} />
            <Button type="submit" className="w-full" disabled={state.availableToman <= 0 || form.formState.isSubmitting}><RiAddLine className="size-5" /> ساخت کارت</Button>
            {state.availableToman <= 0 && <p className="text-center type-caption text-muted-foreground">برای ساخت کارت جدید، ابتدا یکی از کارت‌های برنامه را حذف کن.</p>}
          </form>
        </DialogContent>
      </Dialog>
      <FundEditor open={fundEditorOpen} onOpenChange={setFundEditorOpen} fund={null} settings={settings} onSaved={(fund) => fund.id && selectCreatedTarget(fund.id, fund.name)} />
      <AssetDialog open={assetEditorOpen} onOpenChange={setAssetEditorOpen} asset={null} settings={settings} onSaved={(asset) => asset.id && selectCreatedTarget(asset.id, asset.name)} />
    </>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs type-body-strong text-destructive">{message}</p> : null;
}
