"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { RiEditLine, RiMoneyDollarCircleLine } from "react-icons/ri";
import { createRecoverySnapshot } from "@/lib/recovery";
import { db } from "@/lib/db";
import { assetRequiresManualPrice } from "@/lib/assets";
import { dateToISO, formatMoney, formatNumber, isoToDate } from "@/lib/format";
import { availableQuantityOnDate, investmentLedgerErrorMessage, validateTransactionChange } from "@/lib/investment-ledger";
import { planRemaining, syncInvestmentPlanItem } from "@/lib/plan-execution";
import { toPersianUiError } from "@/lib/errors";
import type { AppSettings, Asset, InvestmentTransaction, PlanItem } from "@/lib/types";
import { transactionSchema, type TransactionFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

const T = {
  createTitle: "ثبت معامله", editTitle: "اصلاح معامله", createDesc: "خرید یا فروش واقعی را ثبت کن تا سود و زیان سبد دقیق بماند.",
  editDesc: "تغییر فقط وقتی ذخیره می‌شود که موجودی تاریخی دارایی در هیچ تاریخی منفی نشود.", plan: "این خرید به برنامه پول ورودی متصل است.",
  suggested: "مبلغ پیشنهادی", type: "نوع", buy: "خرید", sell: "فروش", amount: "مبلغ کل", price: "قیمت واحد", date: "تاریخ", note: "یادداشت اختیاری",
  qty: "مقدار محاسبه‌شده", available: "موجودی قابل فروش در همین تاریخ", over: "مقدار فروش در این تاریخ از موجودی ثبت‌شده بیشتر است.",
  submit: "ثبت", update: "ذخیره اصلاح",
};

export function TransactionDialog({ asset, onClose, suggestedPrice, settings, planItem, initialAmount, incomeId, transaction, transactions }: {
  asset: Asset | null; onClose: () => void; suggestedPrice?: number; settings: AppSettings; planItem?: PlanItem | null;
  initialAmount?: number; incomeId?: number; transaction?: InvestmentTransaction | null; transactions: InvestmentTransaction[];
}) {
  const editing = Boolean(transaction?.id);
  const form = useForm<TransactionFormValues>({ resolver: zodResolver(transactionSchema), defaultValues: { type: "buy", amount: undefined, price: undefined, date: new Date(), note: "" }, mode: "onBlur" });
  const ledgerError = form.formState.errors.root?.ledger?.message;
  const type = useWatch({ control: form.control, name: "type" }) ?? "buy";
  const amount = Number(useWatch({ control: form.control, name: "amount" })) || 0;
  const price = Number(useWatch({ control: form.control, name: "price" })) || 0;
  const date = useWatch({ control: form.control, name: "date" }) ?? new Date();
  const quantity = amount > 0 && price > 0 ? amount / price : 0;
  const availableQty = asset?.id ? availableQuantityOnDate(transactions, asset.id, dateToISO(date), transaction?.id) : 0;
  const overSelling = type === "sell" && quantity > availableQty + 1e-10;
  const linkedPlan = planItem || Boolean(transaction?.planItemId);

  useEffect(() => {
    if (!asset) return;
    form.clearErrors("root.ledger");
    if (transaction) {
      form.reset({ type: transaction.type, amount: transaction.amountToman, price: transaction.unitPriceToman, date: isoToDate(transaction.happenedAt) ?? new Date(), note: transaction.note ?? "" });
      return;
    }
    form.reset({ type: "buy", amount: initialAmount || undefined, price: suggestedPrice || asset.manualPriceToman || undefined, date: new Date(), note: "" });
  }, [asset, form, initialAmount, suggestedPrice, transaction]);

  const save = form.handleSubmit(async (values) => {
    if (!asset?.id || overSelling) return;
    const qty = values.amount / values.price;
    const now = new Date().toISOString();
    const candidate: InvestmentTransaction = {
      id: transaction?.id, assetId: asset.id, type: values.type, amountToman: values.amount, quantity: qty, unitPriceToman: values.price,
      happenedAt: dateToISO(values.date), note: values.note?.trim() || undefined, incomeId: transaction?.incomeId ?? (planItem ? incomeId : undefined),
      planItemId: transaction?.planItemId ?? planItem?.id, createdAt: transaction?.createdAt ?? now,
    };
    const check = validateTransactionChange(transactions.filter((row) => row.assetId === asset.id), candidate, transaction?.id);
    const message = investmentLedgerErrorMessage(check);
    if (message) { form.setError("root.ledger", { type: "validate", message }); return; }
    try {
      if (editing) await createRecoverySnapshot("قبل از اصلاح تراکنش سرمایه‌گذاری");
      if (transaction?.id) {
        const changes = { ...candidate };
        delete changes.id;
        await db.transactions.update(transaction.id, changes);
      } else await db.transactions.add(candidate);
      if (!editing && assetRequiresManualPrice(asset.kind, asset.marketId)) await db.assets.update(asset.id, { manualPriceToman: values.price, updatedAt: now });
      const planId = candidate.planItemId;
      if (planId) await syncInvestmentPlanItem(planId);
      toast({ tone: "success", title: editing ? "تراکنش اصلاح شد" : "تراکنش ثبت شد", description: editing ? "قبل از اصلاح، یک نقطه بازیابی محلی ساخته شد." : undefined });
      onClose();
    } catch (error) {
      toast({ tone: "error", title: editing ? "اصلاح تراکنش انجام نشد" : "ثبت تراکنش انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  });

  return <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader><DialogTitle>{editing ? T.editTitle : T.createTitle} {asset?.name}</DialogTitle><DialogDescription>{editing ? T.editDesc : T.createDesc}</DialogDescription></DialogHeader>
      {linkedPlan && <div className="rounded-xl border border-primary/25 bg-primary/7 p-3 text-xs leading-6"><div className="type-strong text-primary">{T.plan}</div>{planItem && <div className="mt-1 text-muted-foreground">{T.suggested}: {formatMoney(planRemaining(planItem), settings.displayUnit)}</div>}</div>}
      <form onSubmit={save} className="space-y-4">
        <Controller name="type" control={form.control} render={({ field }) => <Field label={T.type}><Select value={field.value} onValueChange={(value) => { form.clearErrors("root.ledger"); field.onChange(value); }} options={linkedPlan ? [{ value: "buy", label: T.buy }] : [{ value: "buy", label: T.buy }, { value: "sell", label: T.sell }]} /></Field>} />
        {type === "sell" && <div className="rounded-xl bg-muted/45 p-3 type-caption text-muted-foreground">{T.available}: <strong dir="ltr" className="text-foreground">{formatNumber(availableQty, 8)}</strong></div>}
        <Controller name="amount" control={form.control} render={({ field, fieldState }) => <Field label={T.amount} error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={(value) => { form.clearErrors("root.ledger"); field.onChange(value); }} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} /></Field>} />
        <Controller name="price" control={form.control} render={({ field, fieldState }) => <Field label={T.price} error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={(value) => { form.clearErrors("root.ledger"); field.onChange(value); }} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} /></Field>} />
        <Controller name="date" control={form.control} render={({ field, fieldState }) => <Field label={T.date} error={fieldState.error?.message}><DatePicker value={field.value} onValueChange={(value) => { if (value) { form.clearErrors("root.ledger"); field.onChange(value); } }} /></Field>} />
        <Controller name="note" control={form.control} render={({ field, fieldState }) => <Field label={T.note} error={fieldState.error?.message}><Textarea {...field} value={field.value ?? ""} maxLength={200} /></Field>} />
        <div className="rounded-xl bg-muted/45 p-3 text-sm"><span className="text-muted-foreground">{T.qty}: </span><strong dir="ltr">{formatNumber(quantity, 8)}</strong></div>
        {(overSelling || ledgerError) && <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 type-caption type-body-strong text-destructive">{ledgerError ?? T.over}</div>}
        <Button type="submit" className="w-full" disabled={overSelling}>{editing ? <RiEditLine /> : <RiMoneyDollarCircleLine />} {editing ? T.update : `${T.submit} ${type === "buy" ? T.buy : T.sell}`}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
