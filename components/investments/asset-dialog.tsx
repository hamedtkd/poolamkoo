"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { db } from "@/lib/db";
import type { AppSettings, Asset, AssetKind } from "@/lib/types";
import { assetSchema, type AssetFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";

const kinds = [
  { value: "gold", label: "طلا" }, { value: "currency", label: "ارز" },
  { value: "crypto", label: "رمزارز" }, { value: "fund", label: "صندوق" },
  { value: "custom", label: "سفارشی" },
];
const targets = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70].map((value) => ({ value: String(value), label: `${new Intl.NumberFormat("fa-IR").format(value)}٪` }));
const symbols = [
  { value: "IR_GOLD_18K", label: "طلای ۱۸ عیار" }, { value: "USD", label: "دلار" },
  { value: "BTC", label: "بیت‌کوین" }, { value: "USDT", label: "تتر" },
];

export function AssetDialog({ open, onOpenChange, asset, settings }: { open: boolean; onOpenChange: (value: boolean) => void; asset: Asset | null; settings: AppSettings }) {
  const form = useForm<AssetFormValues>({ resolver: zodResolver(assetSchema), defaultValues: { name: "", kind: "custom", symbol: "", targetPct: 0, manualPriceToman: null } });
  const kind = form.watch("kind");

  useEffect(() => {
    if (!open) return;
    form.reset({ name: asset?.name ?? "", kind: asset?.kind ?? "custom", symbol: asset?.symbol ?? "", targetPct: asset?.targetPct ?? 0, manualPriceToman: asset?.manualPriceToman ?? null });
  }, [asset, form, open]);

  const save = form.handleSubmit(async (values) => {
    const now = new Date().toISOString();
    const payload = {
      name: values.name.trim(), kind: values.kind, symbol: values.kind === "custom" ? undefined : values.symbol || undefined,
      targetPct: values.targetPct, manualPriceToman: values.kind === "custom" ? values.manualPriceToman ?? undefined : undefined,
      icon: asset?.icon ?? "asset", archived: false, updatedAt: now,
    };
    if (asset?.id) await db.assets.update(asset.id, payload);
    else await db.assets.add({ ...payload, createdAt: now });
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[28px]">
        <DialogHeader><DialogTitle>{asset ? "ویرایش دارایی" : "دارایی جدید"}</DialogTitle><DialogDescription>برای دارایی سفارشی قیمت را دستی ثبت کن؛ نمادهای بازار از API به‌روزرسانی می‌شوند.</DialogDescription></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="نام" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Controller name="kind" control={form.control} render={({ field }) => <Field label="نوع"><Select value={field.value} onValueChange={(value) => field.onChange(value as AssetKind)} options={kinds} /></Field>} />
            <Controller name="targetPct" control={form.control} render={({ field, fieldState }) => <Field label="سهم هدف" error={fieldState.error?.message}><Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))} options={targets} /></Field>} />
          </div>
          {kind !== "custom" ? (
            <Controller name="symbol" control={form.control} render={({ field, fieldState }) => <Field label="نماد بازار" error={fieldState.error?.message}><Select value={field.value ?? ""} onValueChange={field.onChange} placeholder="انتخاب نماد" options={symbols} /></Field>} />
          ) : (
            <Controller name="manualPriceToman" control={form.control} render={({ field, fieldState }) => <Field label="قیمت دستی فعلی" error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} /></Field>} />
          )}
          <Button type="submit" className="w-full">{asset ? "ذخیره تغییرات" : "ساخت دارایی"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm font-bold">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
