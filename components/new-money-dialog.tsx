"use client";

import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { RiArrowLeftLine, RiCheckLine, RiInformationLine, RiShieldCheckLine } from "react-icons/ri";
import type { AllocationRule, AppSettings, Asset, GoalFund, InvestmentTransaction, MarketQuote } from "@/lib/types";
import { formatMoney, formatPercent } from "@/lib/format";
import { useNewMoney } from "@/hooks/use-new-money";
import { NewMoneyAllocationEditor } from "@/components/new-money-allocation-editor";
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
  const router = useRouter();
  const state = useNewMoney({ ...props, onSaved: (incomeId) => { props.onOpenChange(false); router.push(`/income/${incomeId}`); } });
  const {
    form, values, step, setStep, activeRule, effectiveRule, split, safetyPlan, growthPlan,
    smartChanged, allocationValues, allocationChanged, updateAllocation, resetAllocation, next, save,
  } = state;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:w-[min(100%,38rem)]">
        {step === 1 ? (
          <form onSubmit={(event) => { event.preventDefault(); void next(); }} className="space-y-5">
            <DialogHeader>
              <DialogTitle>پول جدید دارم</DialogTitle>
              <DialogDescription>مبلغ را وارد کن تا پولم‌کو تقسیم پیشنهادی این پول را حساب کند.</DialogDescription>
            </DialogHeader>

            <Controller name="amount" control={form.control} render={({ field, fieldState }) => (
              <Field label="مبلغ" error={fieldState.error?.message}>
                <MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={props.settings.displayUnit} placeholder="مثلاً ۱۰٬۰۰۰٬۰۰۰" className="h-14 w-full text-xl" invalid={Boolean(fieldState.error)} />
              </Field>
            )} />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="عنوان" error={form.formState.errors.title?.message}>
                <Input {...form.register("title")} className="h-12 text-base" />
              </Field>
              <Controller name="date" control={form.control} render={({ field, fieldState }) => (
                <Field label="تاریخ" error={fieldState.error?.message}>
                  <DatePicker value={field.value ?? null} onValueChange={(date) => date && field.onChange(date)} className="h-12 text-base" />
                </Field>
              )} />
            </div>

            <Controller name="smart" control={form.control} render={({ field }) => (
              <button type="button" onClick={() => field.onChange(!field.value)} className={cn("flex w-full items-start gap-3 rounded-2xl border p-4 text-start transition", field.value ? "border-primary/30 bg-primary/6" : "bg-muted/30")}>
                <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border", field.value ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{field.value && <RiCheckLine />}</span>
                <span>
                  <span className="flex items-center gap-2 text-sm font-bold"><RiShieldCheckLine className="text-primary" />پیشنهاد هوشمند امنیت</span>
                  <span className="mt-1 block text-xs leading-6 text-muted-foreground">تا وقتی صندوق اضطراری کامل نشده، بخشی از رشد به امنیت منتقل شود.</span>
                </span>
              </button>
            )} />

            {smartChanged && <div className="flex gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-6 text-muted-foreground"><RiInformationLine className="mt-1 size-4 shrink-0 text-primary" />سهم امنیت موقتاً از {formatPercent(activeRule.safetyPct, 0)} به {formatPercent(effectiveRule.safetyPct, 0)} افزایش یافته است.</div>}
            <Button type="submit" size="lg" className="w-full">دیدن تقسیم پیشنهادی <RiArrowLeftLine /></Button>
          </form>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
            <DialogHeader>
              <DialogTitle>برای {formatMoney(values.amount ?? 0, props.settings.displayUnit)} این کار را بکن</DialogTitle>
              <DialogDescription>پیشنهاد از قانون «{activeRule.name}» شروع شده؛ می‌توانی برای همین پول درصدها را تغییر بدهی.</DialogDescription>
            </DialogHeader>

            <NewMoneyAllocationEditor
              amount={values.amount ?? 0}
              values={allocationValues}
              split={split}
              settings={props.settings}
              changed={allocationChanged}
              onChange={updateAllocation}
              onReset={resetAllocation}
            />

            <PlanList title="پیشنهاد برای بخش امنیت" items={safetyPlan.map((item) => ({ key: String(item.fund.id ?? item.fund.name), title: item.fund.name, subtitle: `${Math.round(Math.min(100, (item.fund.currentToman + item.amountToman) / Math.max(1, item.fund.targetToman) * 100))}٪ هدف`, amount: item.amountToman }))} settings={props.settings} />
            <PlanList title="پیشنهاد برای بخش رشد" items={growthPlan.map((item) => ({ key: String(item.asset.id ?? item.asset.name), title: item.asset.name, subtitle: `هدف ${formatPercent(item.normalizedTargetPct, 0)} از سبد رشد`, amount: item.amountToman }))} settings={props.settings} />
            <div className="mt-6 grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setStep(1)}>ویرایش اطلاعات</Button><Button type="submit">ثبت برنامه و رفتن به اجرا <RiCheckLine /></Button></div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="block text-sm font-bold">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function PlanList({ title, items, settings }: { title: string; items: Array<{ key: string; title: string; subtitle: string; amount: number }>; settings: AppSettings }) {
  if (!items.length) return null;
  return <div className="mt-5 rounded-2xl border bg-muted/25 p-4"><div className="mb-3 font-bold">{title}</div><div className="space-y-2">{items.map((item) => <div key={item.key} className="flex items-center justify-between rounded-xl bg-background/70 px-3 py-2 text-sm"><div><div className="font-semibold">{item.title}</div><div className="text-[10px] text-muted-foreground">{item.subtitle}</div></div><strong className="text-primary">{formatMoney(item.amount, settings.displayUnit)}</strong></div>)}</div></div>;
}
