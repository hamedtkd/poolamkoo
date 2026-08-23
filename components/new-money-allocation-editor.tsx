"use client";

import { RiRefreshLine } from "react-icons/ri";
import type { AppSettings, BucketKey } from "@/lib/types";
import type { AllocationRuleFormValues } from "@/lib/validation";
import { formatMoney, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Props {
  amount: number;
  values: AllocationRuleFormValues;
  split: { life: number; safety: number; growth: number };
  settings: AppSettings;
  changed: boolean;
  onChange: (bucket: BucketKey, value: number) => void;
  onReset: () => void;
}

const rows: Array<{ key: BucketKey; formKey: keyof AllocationRuleFormValues; title: string; hint: string }> = [
  { key: "life", formKey: "life", title: "زندگی", hint: "هزینه‌های جاری و سبک زندگی این دوره" },
  { key: "safety", formKey: "safety", title: "امنیت", hint: "ذخیره اضطراری و صندوق‌های پیش‌رو" },
  { key: "growth", formKey: "growth", title: "رشد", hint: "سرمایه‌گذاری و ساخت دارایی" },
];

export function NewMoneyAllocationEditor({ amount, values, split, settings, changed, onChange, onReset }: Props) {
  return (
    <section className="mt-5 space-y-3 rounded-2xl border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">تقسیم این پول</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">برای همین ورودی قابل تغییر است؛ قانون اصلی تو دست‌نخورده می‌ماند.</p>
        </div>
        {changed && <Button type="button" variant="ghost" size="sm" onClick={onReset}><RiRefreshLine /> بازگشت به پیشنهاد</Button>}
      </div>

      {rows.map((row) => {
        const pct = values[row.formKey];
        const rowAmount = split[row.key];
        return (
          <div key={row.key} className="rounded-xl border bg-background/75 p-3">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <div className="font-bold">{row.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{row.hint}</div>
              </div>
              <div className="text-end">
                <div className="text-base font-black text-primary">{formatPercent(pct, 0)}</div>
                <div className="text-[11px] text-muted-foreground">{formatMoney(rowAmount, settings.displayUnit)}</div>
              </div>
            </div>
            <Slider value={[pct]} onValueChange={([next]) => onChange(row.key, next ?? pct)} />
          </div>
        );
      })}

      <div className="flex items-center justify-between rounded-xl bg-primary/8 px-3 py-2 text-xs">
        <span className="text-muted-foreground">جمع تخصیص</span>
        <strong className="text-primary">۱۰۰٪ · {formatMoney(amount, settings.displayUnit)}</strong>
      </div>
    </section>
  );
}
