"use client";

import { useMemo, useState } from "react";
import { RiAddLine, RiDeleteBin6Line, RiHistoryLine, RiWallet3Line } from "react-icons/ri";
import { AssetDialog } from "@/components/investments/asset-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { RelatedEntitySelect } from "@/components/ui/related-entity-select";
import type { OnboardingHolding } from "@/hooks/use-onboarding";
import { formatMoney, formatNumber } from "@/lib/format";
import type { AppSettings, Asset } from "@/lib/types";
import { openingHoldingSchema } from "@/lib/validation";
import { toLatinDigits } from "@/lib/persian-date";

export function OnboardingHoldingsStep({ assets, holdings, settings, onAdd, onRemove }: {
  assets: Asset[];
  holdings: OnboardingHolding[];
  settings: AppSettings;
  onAdd: (input: Omit<OnboardingHolding, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const available = useMemo(() => assets.filter((asset) => asset.id), [assets]);
  const [assetId, setAssetId] = useState<number | undefined>(available[0]?.id);
  const [quantity, setQuantity] = useState<number | undefined>();
  const [price, setPrice] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(new Date());
  const [error, setError] = useState("");
  const [assetEditorOpen, setAssetEditorOpen] = useState(false);
  const selectedAssetId = available.some((asset) => asset.id === assetId) ? assetId : available[0]?.id;

  function add() {
    const result = openingHoldingSchema.safeParse({ assetId: selectedAssetId, quantity, price, date });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "اطلاعات دارایی را کامل کن."); return; }
    onAdd({ assetId: result.data.assetId, quantity: result.data.quantity, price: result.data.price, date: result.data.date });
    setQuantity(undefined); setPrice(null); setDate(new Date()); setError("");
  }

  return (
    <>
      <div>
        <div className="text-xs type-strong text-primary">دارایی‌های فعلی</div>
        <h2 className="mt-2 type-page-title">از صفر شروع نمی‌کنی؟ موجودی قبلی‌ات را بگو</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">اگر دو ماه پیش دلار خریده‌ای یا از قبل سهام و طلا داشته‌ای، مقدار، میانگین قیمت خرید و تاریخ تقریبی را ثبت کن. اگر دارایی موردنظرت در لیست نیست، بدون خروج از این مرحله همان‌جا آن را بساز.</p>
        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-2xl border bg-card/70 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 type-strong"><RiHistoryLine className="text-primary" /> افزودن موجودی اولیه</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="دارایی">
                <RelatedEntitySelect
                  value={selectedAssetId ? String(selectedAssetId) : undefined}
                  onValueChange={(value) => setAssetId(Number(value))}
                  options={available.map((asset) => ({ value: String(asset.id), label: asset.name }))}
                  placeholder="دارایی را انتخاب کن"
                  createLabel="دارایی جدید"
                  onCreate={() => setAssetEditorOpen(true)}
                />
              </Field>
              <Field label="مقدار / تعداد"><Input dir="ltr" inputMode="decimal" placeholder="مثلاً 120" value={quantity ?? ""} onChange={(event) => setQuantity(parseDecimal(event.target.value))} /></Field>
              <Field label="میانگین قیمت خرید هر واحد"><MoneyInput value={price} onValueChange={setPrice} unit={settings.displayUnit} /></Field>
              <Field label="تاریخ تقریبی خرید"><DatePicker value={date} onValueChange={setDate} /></Field>
            </div>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            <Button type="button" variant="outline" className="mt-4 w-full" onClick={add} disabled={!available.length}><RiAddLine /> افزودن به موجودی اولیه</Button>
          </div>

          <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 type-strong"><RiWallet3Line className="text-primary" /> موجودی‌هایی که ثبت می‌شوند</div>
            {holdings.length ? <div className="space-y-2">{holdings.map((holding) => {
              const asset = assets.find((item) => item.id === holding.assetId);
              return <div key={holding.id} className="flex items-center gap-3 rounded-xl border bg-background/70 p-3"><div className="min-w-0 flex-1"><div className="type-label">{asset?.name ?? "دارایی"}</div><div className="mt-1 type-caption text-muted-foreground">{formatNumber(holding.quantity, 8)} واحد · بهای خرید {formatMoney(holding.quantity * holding.price, settings.displayUnit)}</div></div><Button type="button" size="icon" variant="ghost" aria-label="حذف دارایی قبلی" onClick={() => onRemove(holding.id)}><RiDeleteBin6Line /></Button></div>;
            })}</div> : <div className="grid min-h-40 place-items-center text-center"><div><RiWallet3Line className="mx-auto size-8 text-muted-foreground/60" /><p className="mt-3 text-sm text-muted-foreground">اگر موجودی قبلی نداری، بدون افزودن چیزی ادامه بده.</p></div></div>}
          </div>
        </div>
      </div>
      <AssetDialog open={assetEditorOpen} onOpenChange={setAssetEditorOpen} asset={null} settings={settings} onSaved={(asset) => asset.id && setAssetId(asset.id)} />
    </>
  );
}

function parseDecimal(value: string) {
  const normalized = toLatinDigits(value).replace(/,/g, "").replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return normalized && Number.isFinite(parsed) ? parsed : undefined;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}</div>;
}
