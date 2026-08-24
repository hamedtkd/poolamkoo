"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { RiHistoryLine } from "react-icons/ri";
import { AssetDialog } from "@/components/investments/asset-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { RelatedEntitySelect } from "@/components/ui/related-entity-select";
import { saveOpeningHolding } from "@/lib/opening-holdings";
import { dateToISO, formatMoney } from "@/lib/format";
import type { AppSettings, Asset } from "@/lib/types";
import { openingHoldingSchema, type OpeningHoldingFormValues } from "@/lib/validation";
import { toLatinDigits } from "@/lib/persian-date";

export function OpeningHoldingDialog({ open, onOpenChange, assets, settings }: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  assets: Asset[];
  settings: AppSettings;
}) {
  const [assetEditorOpen, setAssetEditorOpen] = useState(false);
  const form = useForm<OpeningHoldingFormValues>({
    resolver: zodResolver(openingHoldingSchema),
    defaultValues: { assetId: assets[0]?.id, quantity: undefined, price: undefined, date: new Date() },
    mode: "onBlur",
  });
  const quantity = Number(useWatch({ control: form.control, name: "quantity" })) || 0;
  const price = Number(useWatch({ control: form.control, name: "price" })) || 0;

  useEffect(() => {
    if (!open) return;
    form.reset({ assetId: assets[0]?.id, quantity: undefined, price: undefined, date: new Date() });
  }, [assets, form, open]);

  const save = form.handleSubmit(async (values) => {
    await saveOpeningHolding({ assetId: values.assetId, quantity: values.quantity, unitPriceToman: values.price, happenedAt: dateToISO(values.date) });
    onOpenChange(false);
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>دارایی قبلی را وارد کن</DialogTitle>
            <DialogDescription>اگر قبل از پولم‌کو دلار، طلا، رمزارز، سهام یا سرمایه‌گذاری دیگری داشته‌ای، مقدار و میانگین قیمت خرید را ثبت کن.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <Controller name="assetId" control={form.control} render={({ field, fieldState }) => (
              <Field label="دارایی" error={fieldState.error?.message}>
                <RelatedEntitySelect
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                  options={assets.filter((asset) => asset.id).map((asset) => ({ value: String(asset.id), label: asset.name }))}
                  placeholder="دارایی را انتخاب کن"
                  createLabel="دارایی جدید"
                  onCreate={() => setAssetEditorOpen(true)}
                />
              </Field>
            )} />
            <Controller name="quantity" control={form.control} render={({ field, fieldState }) => <Field label="مقدار / تعداد" error={fieldState.error?.message}><Input dir="ltr" inputMode="decimal" placeholder="مثلاً 120" value={field.value ?? ""} onChange={(event) => field.onChange(parseDecimal(event.target.value))} /></Field>} />
            <Controller name="price" control={form.control} render={({ field, fieldState }) => <Field label="میانگین قیمت خرید هر واحد" error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} /></Field>} />
            <Controller name="date" control={form.control} render={({ field, fieldState }) => <Field label="تاریخ تقریبی خرید" error={fieldState.error?.message}><DatePicker value={field.value} onValueChange={(value) => value && field.onChange(value)} /></Field>} />
            {quantity > 0 && price > 0 && <div className="rounded-xl border bg-muted/35 p-3 type-caption text-muted-foreground">بهای خرید ثبت‌شده: <strong className="text-foreground">{formatMoney(quantity * price, settings.displayUnit)}</strong></div>}
            <Button type="submit" className="w-full"><RiHistoryLine /> ثبت در موجودی فعلی</Button>
          </form>
        </DialogContent>
      </Dialog>
      <AssetDialog open={assetEditorOpen} onOpenChange={setAssetEditorOpen} asset={null} settings={settings} onSaved={(asset) => asset.id && form.setValue("assetId", asset.id, { shouldDirty: true, shouldValidate: true })} />
    </>
  );
}

function parseDecimal(value: string) {
  const normalized = toLatinDigits(value).replace(/,/g, "").replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return normalized && Number.isFinite(parsed) ? parsed : undefined;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
