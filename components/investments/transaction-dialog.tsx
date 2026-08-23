"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { db } from "@/lib/db";
import { dateToISO, formatMoney, formatNumber } from "@/lib/format";
import { planRemaining, syncInvestmentPlanItem } from "@/lib/plan-execution";
import type { AppSettings, Asset, PlanItem } from "@/lib/types";
import { transactionSchema, type TransactionFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";

const T = {
  title: "\u062b\u0628\u062a \u0645\u0639\u0627\u0645\u0644\u0647",
  desc: "\u062e\u0631\u06cc\u062f \u06cc\u0627 \u0641\u0631\u0648\u0634 \u0648\u0627\u0642\u0639\u06cc \u0631\u0627 \u062b\u0628\u062a \u06a9\u0646 \u062a\u0627 \u0633\u0648\u062f \u0648 \u0632\u06cc\u0627\u0646 \u0633\u0628\u062f \u062f\u0642\u06cc\u0642 \u0628\u0645\u0627\u0646\u062f.",
  plan: "\u0627\u06cc\u0646 \u062e\u0631\u06cc\u062f \u0628\u0647 \u0628\u0631\u0646\u0627\u0645\u0647 \u067e\u0648\u0644 \u0648\u0631\u0648\u062f\u06cc \u0645\u062a\u0635\u0644 \u0645\u06cc\u200c\u0634\u0648\u062f.",
  suggested: "\u0645\u0628\u0644\u063a \u067e\u06cc\u0634\u0646\u0647\u0627\u062f\u06cc",
  type: "\u0646\u0648\u0639",
  buy: "\u062e\u0631\u06cc\u062f",
  sell: "\u0641\u0631\u0648\u0634",
  amount: "\u0645\u0628\u0644\u063a \u06a9\u0644",
  price: "\u0642\u06cc\u0645\u062a \u0648\u0627\u062d\u062f",
  date: "\u062a\u0627\u0631\u06cc\u062e",
  qty: "\u0645\u0642\u062f\u0627\u0631 \u0645\u062d\u0627\u0633\u0628\u0647\u200c\u0634\u062f\u0647",
  available: "\u0645\u0648\u062c\u0648\u062f\u06cc \u0642\u0627\u0628\u0644 \u0641\u0631\u0648\u0634",
  over: "\u0645\u0642\u062f\u0627\u0631 \u0641\u0631\u0648\u0634 \u0627\u0632 \u0645\u0648\u062c\u0648\u062f\u06cc \u062b\u0628\u062a\u200c\u0634\u062f\u0647 \u0628\u06cc\u0634\u062a\u0631 \u0627\u0633\u062a.",
  submit: "\u062b\u0628\u062a",
};

export function TransactionDialog({ asset, onClose, suggestedPrice, availableQty, settings, planItem, initialAmount, incomeId }: {
  asset: Asset | null;
  onClose: () => void;
  suggestedPrice?: number;
  availableQty: number;
  settings: AppSettings;
  planItem?: PlanItem | null;
  initialAmount?: number;
  incomeId?: number;
}) {
  const form = useForm<TransactionFormValues>({ resolver: zodResolver(transactionSchema), defaultValues: { type: "buy", amount: undefined, price: undefined, date: new Date() }, mode: "onBlur" });
  const type = form.watch("type");
  const amount = Number(form.watch("amount")) || 0;
  const price = Number(form.watch("price")) || 0;
  const quantity = amount > 0 && price > 0 ? amount / price : 0;
  const overSelling = type === "sell" && quantity > availableQty + 1e-10;

  useEffect(() => {
    if (!asset) return;
    form.reset({ type: planItem ? "buy" : "buy", amount: initialAmount || undefined, price: suggestedPrice || asset.manualPriceToman || undefined, date: new Date() });
  }, [asset, form, initialAmount, planItem?.id, suggestedPrice]);

  const save = form.handleSubmit(async (values) => {
    if (!asset?.id || overSelling) return;
    const qty = values.amount / values.price;
    const now = new Date().toISOString();
    await db.transactions.add({
      assetId: asset.id,
      type: values.type,
      amountToman: values.amount,
      quantity: qty,
      unitPriceToman: values.price,
      happenedAt: dateToISO(values.date),
      incomeId: planItem ? incomeId : undefined,
      planItemId: planItem?.id,
      createdAt: now,
    });
    if (asset.kind === "custom") await db.assets.update(asset.id, { manualPriceToman: values.price, updatedAt: now });
    if (planItem?.id && values.type === "buy") await syncInvestmentPlanItem(planItem.id);
    onClose();
  });

  return <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader><DialogTitle>{T.title} {asset?.name}</DialogTitle><DialogDescription>{T.desc}</DialogDescription></DialogHeader>
      {planItem && <div className="rounded-xl border border-primary/25 bg-primary/7 p-3 text-xs leading-6"><div className="font-bold text-primary">{T.plan}</div><div className="mt-1 text-muted-foreground">{T.suggested}: {formatMoney(planRemaining(planItem), settings.displayUnit)}</div></div>}
      <form onSubmit={save} className="space-y-4">
        <Controller name="type" control={form.control} render={({ field }) => <Field label={T.type}><Select value={field.value} onValueChange={field.onChange} options={planItem ? [{ value: "buy", label: T.buy }] : [{ value: "buy", label: T.buy }, { value: "sell", label: T.sell }]} /></Field>} />
        {type === "sell" && <div className="rounded-xl bg-muted/45 p-3 text-xs text-muted-foreground">{T.available}: <strong dir="ltr" className="text-foreground">{formatNumber(availableQty, 8)}</strong></div>}
        <Controller name="amount" control={form.control} render={({ field, fieldState }) => <Field label={T.amount} error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} /></Field>} />
        <Controller name="price" control={form.control} render={({ field, fieldState }) => <Field label={T.price} error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} /></Field>} />
        <Controller name="date" control={form.control} render={({ field, fieldState }) => <Field label={T.date} error={fieldState.error?.message}><DatePicker value={field.value} onValueChange={(date) => date && field.onChange(date)} /></Field>} />
        <div className="rounded-xl bg-muted/45 p-3 text-sm"><span className="text-muted-foreground">{T.qty}: </span><strong dir="ltr">{formatNumber(quantity, 8)}</strong></div>
        {overSelling && <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-xs font-semibold text-destructive">{T.over}</div>}
        <Button type="submit" className="w-full" disabled={overSelling}><RiMoneyDollarCircleLine /> {T.submit} {type === "buy" ? T.buy : T.sell}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm font-bold">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
