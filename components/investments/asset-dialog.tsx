"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ExchangeInstrumentPicker } from "@/components/investments/exchange-instrument-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { db } from "@/lib/db";
import { assetRequiresManualPrice, assetSupportsExchangeLink, assetUsesManualPrice } from "@/lib/assets";
import type { AppSettings, Asset, AssetKind, MarketInstrument } from "@/lib/types";
import { assetSchema, type AssetFormValues } from "@/lib/validation";

const kinds = [
  { value: "gold", label: "طلا" },
  { value: "currency", label: "ارز" },
  { value: "crypto", label: "رمزارز" },
  { value: "stock", label: "سهام / بورس" },
  { value: "fund", label: "صندوق سرمایه‌گذاری" },
  { value: "custom", label: "سفارشی" },
];
const targets = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70].map((value) => ({
  value: String(value), label: `${new Intl.NumberFormat("fa-IR").format(value)}٪`,
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
  initialName?: string;
  initialInstrument?: MarketInstrument;
  initialKind?: AssetKind;
}

export function AssetDialog({ open, onOpenChange, asset, settings, onSaved, initialName, initialInstrument, initialKind }: AssetDialogProps) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: { name: "", kind: "custom", symbol: "", marketId: undefined, marketSource: undefined, targetPct: 0, manualPriceToman: null },
  });
  const kind: AssetKind = useWatch({ control: form.control, name: "kind" }) ?? "custom";
  const name = useWatch({ control: form.control, name: "name" }) ?? "";
  const symbol = useWatch({ control: form.control, name: "symbol" }) ?? "";
  const marketId = useWatch({ control: form.control, name: "marketId" });
  const marketSource = useWatch({ control: form.control, name: "marketSource" });
  const symbolOptions = marketSymbols[kind];
  const exchangeKind = assetSupportsExchangeLink(kind);

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: asset?.name ?? initialInstrument?.name ?? initialName ?? "",
      kind: asset?.kind ?? initialKind ?? "custom",
      symbol: asset?.symbol ?? initialInstrument?.symbol ?? "",
      marketId: asset?.marketId ?? initialInstrument?.id,
      marketSource: asset?.marketSource ?? initialInstrument?.source,
      targetPct: asset?.targetPct ?? 0,
      manualPriceToman: asset?.manualPriceToman ?? initialInstrument?.priceToman ?? null,
    });
  }, [asset, form, initialInstrument, initialKind, initialName, open]);

  function selectInstrument(instrument: MarketInstrument) {
    form.setValue("name", instrument.name, { shouldDirty: true, shouldValidate: true });
    form.setValue("symbol", instrument.symbol, { shouldDirty: true, shouldValidate: true });
    form.setValue("marketId", instrument.id, { shouldDirty: true, shouldValidate: true });
    form.setValue("marketSource", instrument.source, { shouldDirty: true, shouldValidate: true });
    if (instrument.priceToman) form.setValue("manualPriceToman", instrument.priceToman, { shouldDirty: true });
  }

  function clearInstrument() {
    form.setValue("marketId", undefined, { shouldDirty: true, shouldValidate: true });
    form.setValue("marketSource", undefined, { shouldDirty: true, shouldValidate: true });
  }

  const save = form.handleSubmit(async (values) => {
    const now = new Date().toISOString();
    const linked = assetSupportsExchangeLink(values.kind) && Boolean(values.marketSource) && Boolean(values.marketId);
    const payload = {
      name: values.name.trim(),
      kind: values.kind,
      symbol: values.kind === "stock" || values.kind === "fund" || marketSymbols[values.kind] ? values.symbol?.trim() || undefined : undefined,
      marketId: linked ? values.marketId : undefined,
      marketSource: linked ? values.marketSource : undefined,
      targetPct: values.targetPct,
      manualPriceToman: assetUsesManualPrice(values.kind) ? values.manualPriceToman ?? undefined : undefined,
      icon: asset?.icon ?? (values.kind === "stock" ? "stock" : values.kind === "fund" ? "fund" : "asset"),
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

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[28px]">
      <DialogHeader><DialogTitle>{asset ? "ویرایش دارایی" : "دارایی جدید"}</DialogTitle><DialogDescription>دلار، طلا و رمزارز از BrsApi قیمت می‌گیرند. سهام و صندوق‌های قابل معامله هم می‌توانند به قیمت بازار بورس متصل شوند.</DialogDescription></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <Field label="نام" error={form.formState.errors.name?.message}><Input {...form.register("name")} placeholder={kind === "stock" ? "مثلاً فولاد مبارکه" : kind === "fund" ? "مثلاً صندوق طلای عیار" : undefined} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Controller name="kind" control={form.control} render={({ field }) => <Field label="نوع"><Select value={field.value} onValueChange={(value) => field.onChange(value as AssetKind)} options={kinds} /></Field>} />
          <Controller name="targetPct" control={form.control} render={({ field, fieldState }) => <Field label="سهم هدف" error={fieldState.error?.message}><Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))} options={targets} /></Field>} />
        </div>
        {symbolOptions && <Controller name="symbol" control={form.control} render={({ field, fieldState }) => <Field label="نماد بازار" error={fieldState.error?.message}><Select value={field.value ?? ""} onValueChange={field.onChange} placeholder="انتخاب نماد" options={symbolOptions} /></Field>} />}
        {exchangeKind && <Field label="اتصال به بورس" error={form.formState.errors.marketId?.message}>
          <ExchangeInstrumentPicker selected={marketId && marketSource ? { id: marketId, symbol, name, source: marketSource } : undefined} settings={settings} onSelect={selectInstrument} onClear={clearInstrument} />
        </Field>}
        {exchangeKind && !marketId && <Controller name="symbol" control={form.control} render={({ field, fieldState }) => <Field label="نماد دستی (اختیاری)" error={fieldState.error?.message}><Input value={field.value ?? ""} onChange={field.onChange} placeholder="مثلاً عیار" /></Field>} />}
        {assetUsesManualPrice(kind) && <Controller name="manualPriceToman" control={form.control} render={({ field, fieldState }) => <Field label={assetRequiresManualPrice(kind, marketId) ? "قیمت فعلی" : "قیمت پشتیبان"} error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} /><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{marketId ? "اگر سرویس بازار موقتاً قطع شود، آخرین Snapshot واقعی اولویت دارد و بعد از این قیمت پشتیبان استفاده می‌شود." : "تا وقتی دارایی را به بازار وصل نکرده‌ای، این قیمت برای ارزش‌گذاری سبد لازم است."}</p></Field>} />}
        <Button type="submit" className="w-full">{asset ? "ذخیره تغییرات" : "ساخت دارایی"}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
