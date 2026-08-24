"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { db } from "@/lib/db";
import { assetUsesManualPrice } from "@/lib/assets";
import type { AppSettings, Asset, AssetKind } from "@/lib/types";
import { assetSchema, type AssetFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";

const kinds = [
  { value: "gold", label: "طلا" },
  { value: "currency", label: "ارز" },
  { value: "crypto", label: "رمزارز" },
  { value: "stock", label: "سهام / بورس" },
  { value: "fund", label: "صندوق سرمایه‌گذاری" },
  { value: "custom", label: "سفارشی" },
];
const targets = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70].map((value) => ({
  value: String(value),
  label: `${new Intl.NumberFormat("fa-IR").format(value)}٪`,
}));
const marketSymbols: Partial<Record<AssetKind, Array<{ value: string; label: string }>>> = {
  gold: [{ value: "IR_GOLD_18K", label: "طلای ۱۸ عیار" }],
  currency: [{ value: "USD", label: "دلار" }],
  crypto: [{ value: "BTC", label: "بیت‌کوین" }, { value: "USDT", label: "تتر" }],
};

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  asset: Asset | null;
  settings: AppSettings;
  onSaved?: (asset: Asset) => void;
}

export function AssetDialog({ open, onOpenChange, asset, settings, onSaved }: AssetDialogProps) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: { name: "", kind: "custom", symbol: "", targetPct: 0, manualPriceToman: null },
  });
  const kind: AssetKind = useWatch({ control: form.control, name: "kind" }) ?? "custom";
  const symbolOptions = marketSymbols[kind];

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: asset?.name ?? "",
      kind: asset?.kind ?? "custom",
      symbol: asset?.symbol ?? "",
      targetPct: asset?.targetPct ?? 0,
      manualPriceToman: asset?.manualPriceToman ?? null,
    });
  }, [asset, form, open]);

  const save = form.handleSubmit(async (values) => {
    const now = new Date().toISOString();
    const manual = assetUsesManualPrice(values.kind);
    const payload = {
      name: values.name.trim(),
      kind: values.kind,
      symbol: values.kind === "stock" || marketSymbols[values.kind] ? values.symbol?.trim() || undefined : undefined,
      targetPct: values.targetPct,
      manualPriceToman: manual ? values.manualPriceToman ?? undefined : undefined,
      icon: asset?.icon ?? (values.kind === "stock" ? "stock" : "asset"),
      archived: false,
      updatedAt: now,
    } satisfies Omit<Asset, "id" | "createdAt">;

    let saved: Asset;
    if (asset?.id) {
      await db.assets.update(asset.id, payload);
      saved = { ...asset, ...payload };
    } else {
      const id = await db.assets.add({ ...payload, createdAt: now });
      saved = { ...payload, id: Number(id), createdAt: now };
    }
    onSaved?.(saved);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[28px]">
        <DialogHeader>
          <DialogTitle>{asset ? "ویرایش دارایی" : "دارایی جدید"}</DialogTitle>
          <DialogDescription>دارایی‌های بازار پشتیبانی‌شده قیمت خودکار می‌گیرند؛ سهام، صندوق و دارایی سفارشی فعلاً با قیمت دستی مدیریت می‌شوند.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <Field label="نام" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder={kind === "stock" ? "مثلاً شستا" : undefined} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Controller name="kind" control={form.control} render={({ field }) => (
              <Field label="نوع"><Select value={field.value} onValueChange={(value) => field.onChange(value as AssetKind)} options={kinds} /></Field>
            )} />
            <Controller name="targetPct" control={form.control} render={({ field, fieldState }) => (
              <Field label="سهم هدف" error={fieldState.error?.message}><Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))} options={targets} /></Field>
            )} />
          </div>
          {symbolOptions && <Controller name="symbol" control={form.control} render={({ field, fieldState }) => (
            <Field label="نماد بازار" error={fieldState.error?.message}><Select value={field.value ?? ""} onValueChange={field.onChange} placeholder="انتخاب نماد" options={symbolOptions} /></Field>
          )} />}
          {kind === "stock" && <Controller name="symbol" control={form.control} render={({ field, fieldState }) => (
            <Field label="نماد بورسی (اختیاری)" error={fieldState.error?.message}><Input value={field.value ?? ""} onChange={field.onChange} placeholder="مثلاً شستا" dir="ltr" /></Field>
          )} />}
          {assetUsesManualPrice(kind) && <Controller name="manualPriceToman" control={form.control} render={({ field, fieldState }) => (
            <Field label={kind === "stock" ? "قیمت فعلی هر سهم" : "قیمت دستی فعلی"} error={fieldState.error?.message}>
              <MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} />
            </Field>
          )} />}
          {kind === "stock" && <p className="rounded-xl bg-muted/55 px-3 py-2 text-xs leading-6 text-muted-foreground">در این نسخه سهام به‌عنوان دارایی مستقل ثبت می‌شود و قیمت فعلی را خودت به‌روزرسانی می‌کنی. اتصال مستقیم به قیمت بورس در فاز Provider انجام می‌شود.</p>}
          <Button type="submit" className="w-full">{asset ? "ذخیره تغییرات" : "ساخت دارایی"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
