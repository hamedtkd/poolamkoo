"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { RiArrowLeftLine, RiCheckLine, RiInformationLine, RiShieldCheckLine } from "react-icons/ri";
import type { AllocationRule, AppSettings, Asset, GoalFund, InvestmentTransaction, MarketQuote } from "@/lib/types";
import { formatMoney, formatPercent } from "@/lib/format";
import { useNewMoney } from "@/hooks/use-new-money";
import { FundEditor } from "@/components/funds/fund-editor";
import { NewMoneyAllocationEditor } from "@/components/new-money-allocation-editor";
import { NewMoneyDirectFunds } from "@/components/new-money-direct-funds";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  rule?: AllocationRule;
  settings: AppSettings;
  funds: GoalFund[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
}

export function NewMoneyDialog(props: Props) {
  return <Dialog open={props.open} onOpenChange={props.onOpenChange}>{props.open ? <NewMoneyDialogSession {...props} /> : null}</Dialog>;
}

function NewMoneyDialogSession(props: Props) {
  const router = useRouter();
  const [fundEditorOpen, setFundEditorOpen] = useState(false);
  const [fundTargetRow, setFundTargetRow] = useState<string>();
  const state = useNewMoney({
    rule: props.rule,
    settings: props.settings,
    funds: props.funds,
    assets: props.assets,
    transactions: props.transactions,
    quotes: props.quotes,
    onSaved: (incomeId) => {
      props.onOpenChange(false);
      router.push(`/income/${incomeId}`);
    },
  });
  const { form, values, step, setStep, activeRule, effectiveRule, split, safetyPlan, growthPlan, smartChanged, allocationValues, allocationChanged, updateAllocation, resetAllocation, next, save } = state;

  function openFundEditor(rowId?: string) {
    setFundTargetRow(rowId);
    setFundEditorOpen(true);
  }

  return (
    <>
      <DialogContent className="sm:w-[min(100%,42rem)]">
        {step === 1 ? (
          <form onSubmit={(event) => { event.preventDefault(); void next(); }} className="space-y-5">
            <DialogHeader>
              <DialogTitle>پول جدید دارم</DialogTitle>
              <DialogDescription>مبلغ را وارد کن؛ در مرحله بعد اول مقصدهای قطعی را کنار می‌گذاری و باقی‌مانده را برنامه‌ریزی می‌کنی.</DialogDescription>
            </DialogHeader>
            <Controller name="amount" control={form.control} render={({ field, fieldState }) => (
              <Field label="مبلغ" error={fieldState.error?.message}>
                <MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={props.settings.displayUnit} placeholder="مثلاً ۱۰٬۰۰۰٬۰۰۰" className="h-14 w-full text-xl" invalid={Boolean(fieldState.error)} />
              </Field>
            )} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="عنوان" error={form.formState.errors.title?.message}><Input {...form.register("title")} className="h-12 text-base" /></Field>
              <Controller name="date" control={form.control} render={({ field, fieldState }) => (
                <Field label="تاریخ" error={fieldState.error?.message}><DatePicker value={field.value ?? null} onValueChange={(date) => date && field.onChange(date)} className="h-12 text-base" /></Field>
              )} />
            </div>
            <Controller name="smart" control={form.control} render={({ field }) => (
              <button type="button" onClick={() => field.onChange(!field.value)} className={cn("flex w-full items-start gap-3 rounded-2xl border p-4 text-start transition", field.value ? "border-primary/30 bg-primary/6" : "bg-muted/30")}>
                <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border", field.value ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{field.value && <RiCheckLine />}</span>
                <span><span className="flex items-center gap-2 text-sm type-strong"><RiShieldCheckLine className="text-primary" />پیشنهاد هوشمند امنیت</span><span className="mt-1 block text-xs leading-6 text-muted-foreground">تا وقتی صندوق اضطراری کامل نشده، بخشی از رشد به امنیت منتقل شود.</span></span>
              </button>
            )} />
            {smartChanged && <div className="flex gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-6 text-muted-foreground"><RiInformationLine className="mt-1 size-4 shrink-0 text-primary" />سهم امنیت موقتاً از {formatPercent(activeRule.safetyPct, 0)} به {formatPercent(effectiveRule.safetyPct, 0)} افزایش یافته است.</div>}
            <Button type="submit" size="lg" className="w-full">رفتن به تخصیص پول <RiArrowLeftLine /></Button>
          </form>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
            <DialogHeader>
              <DialogTitle>برای {formatMoney(values.amount ?? 0, props.settings.displayUnit)} تصمیم بگیر</DialogTitle>
              <DialogDescription>اول مبالغ قطعی را مستقیم کنار بگذار؛ قانون «{activeRule.name}» فقط روی باقی‌مانده اعمال می‌شود.</DialogDescription>
            </DialogHeader>

            <NewMoneyDirectFunds
              rows={state.directFunds}
              funds={props.funds}
              amount={values.amount ?? 0}
              directTotal={state.directTotal}
              remainingAmount={state.remainingAmount}
              error={state.directError}
              settings={props.settings}
              onAdd={state.addDirectFund}
              onChange={state.updateDirectFund}
              onRemove={state.removeDirectFund}
              onCreateFund={openFundEditor}
            />

            <div className="mt-5 border-t pt-5">
              <div className="mb-3"><div className="type-strong">برنامه‌ریزی باقی‌مانده</div><p className="mt-1 type-caption text-muted-foreground">درصدهای زیر روی {formatMoney(state.remainingAmount, props.settings.displayUnit)} اعمال می‌شوند.</p></div>
              <NewMoneyAllocationEditor amount={state.remainingAmount} values={allocationValues} split={split} settings={props.settings} changed={allocationChanged} onChange={updateAllocation} onReset={resetAllocation} />
            </div>

            <PlanList title="پیشنهاد برای بخش امنیت" items={safetyPlan.map((item) => ({ key: String(item.fund.id ?? item.fund.name), title: item.fund.name, subtitle: `${Math.round(Math.min(100, (item.fund.currentToman + item.amountToman) / Math.max(1, item.fund.targetToman) * 100))}٪ هدف`, amount: item.amountToman }))} settings={props.settings} />
            <PlanList title="پیشنهاد برای بخش رشد" items={growthPlan.map((item) => ({ key: String(item.asset.id ?? item.asset.name), title: item.asset.name, subtitle: `هدف ${formatPercent(item.normalizedTargetPct, 0)} از سبد رشد`, amount: item.amountToman }))} settings={props.settings} />
            <div className="mt-6 grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setStep(1)}>ویرایش اطلاعات</Button><Button type="submit" disabled={Boolean(state.directError)}>ثبت و رفتن به اجرا <RiCheckLine /></Button></div>
          </form>
        )}
      </DialogContent>
      <FundEditor
        open={fundEditorOpen}
        onOpenChange={setFundEditorOpen}
        fund={null}
        settings={props.settings}
        onSaved={(fund) => {
          if (fundTargetRow && fund.id) state.updateDirectFund(fundTargetRow, { fundId: fund.id });
        }}
      />
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="block text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function PlanList({ title, items, settings }: { title: string; items: Array<{ key: string; title: string; subtitle: string; amount: number }>; settings: AppSettings }) {
  if (!items.length) return null;
  return <div className="mt-5 rounded-2xl border bg-muted/25 p-4"><div className="mb-3 type-strong">{title}</div><div className="space-y-2">{items.map((item) => <div key={item.key} className="flex items-center justify-between rounded-xl bg-background/70 px-3 py-2 text-sm"><div><div className="type-label">{item.title}</div><div className="text-[10px] text-muted-foreground">{item.subtitle}</div></div><strong className="text-primary">{formatMoney(item.amount, settings.displayUnit)}</strong></div>)}</div></div>;
}
