"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { formatMoney, formatPercent, formatSignedMoney } from "@/lib/format";
import { loanBreakEvenAnnualRate, loanScenarioProjection } from "@/lib/loans/calculations";
import type { LoanView } from "@/lib/loans/analytics";
import type { AppSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LoanScenarios({ view, settings }: { view: LoanView; settings: AppSettings }) {
  const breakEven = loanBreakEvenAnnualRate(view.loan);
  const presets = [20, Number(breakEven.toFixed(1)), 30, 35, 40];
  const [rate, setRate] = useState(35);
  const [shockPct, setShockPct] = useState(-20);
  const projection = useMemo(() => loanScenarioProjection({ initialBalanceToman: view.loan.principalToman, annualEffectiveReturnPct: rate, months: view.loan.termMonths, monthlyWithdrawalToman: view.installmentToman }), [rate, view.installmentToman, view.loan.principalToman, view.loan.termMonths]);
  const spread = rate - breakEven;
  const shockDeltaToman = view.linkedAssetValueToman * shockPct / 100;
  const stressedAssetValueToman = Math.max(0, view.linkedAssetValueToman + shockDeltaToman);
  const stressedNetEffectToman = view.netStrategyEffectToman + shockDeltaToman;
  const shockInstallments = view.installmentToman > 0 ? Math.abs(shockDeltaToman) / view.installmentToman : 0;
  const manageability = shockInstallments <= 2 ? "هنوز قابل مدیریت" : shockInstallments <= 6 ? "قابل تحمل" : "نیازمند بازبینی";

  return <div className="space-y-4">
    <Card className="border-amber-500/25 bg-amber-500/[.035]"><CardContent className="p-4"><div className="type-strong">این بخش سناریو است، نه پیش‌بینی بازار.</div><p className="mt-1 type-caption leading-6 text-muted-foreground">فرض می‌کنیم کل مبلغ وام از ابتدا با یک نرخ موثر ثابت رشد کند و هر ماه یک قسط از همان سبد خارج شود. نوسان واقعی بازار و ترتیب بازده‌ها می‌تواند نتیجه متفاوتی بسازد.</p></CardContent></Card>
    <Card><CardHeader><CardTitle>بازده موثر سالانه فرضی</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{[...new Set(presets)].map((value) => <Button key={value} variant={Math.abs(rate - value) < 0.01 ? "default" : "outline"} onClick={() => setRate(value)}>{formatPercent(value, 1)}</Button>)}</div><div className="mt-4 max-w-xs"><label className="type-label">سناریوی سفارشی</label><Input className="mt-2" type="number" min={-99} step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))}/></div></CardContent></Card>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><ScenarioStat label="مانده پایان دوره" value={formatSignedMoney(projection.endingBalanceToman, settings.displayUnit, true)} tone={projection.endingBalanceToman >= 0 ? "profit" : "loss"}/><ScenarioStat label="فاصله با سر به سر" value={`${spread >= 0 ? "+" : ""}${formatPercent(spread, 1)}`} tone={spread >= 0 ? "profit" : "loss"}/><ScenarioStat label="مجموع برداشت اقساط" value={formatMoney(projection.totalWithdrawalsToman, settings.displayUnit, true)}/><ScenarioStat label="تمام شدن سرمایه" value={projection.depletedAtMonth ? `ماه ${projection.depletedAtMonth.toLocaleString("fa-IR")}` : "در این سناریو تمام نمی‌شود"}/></div>
    <Card><CardHeader><CardTitle>آزمون شوک بازار</CardTitle><p className="mt-1 type-caption leading-6 text-muted-foreground">یک شوک یکسان فقط روی ارزش دارایی‌های متصل اعمال می‌شود؛ ذخیره اقساط و وجه نقد ثابت می‌مانند. این آزمون پیش‌بینی بازار نیست.</p></CardHeader><CardContent><div className="flex flex-wrap gap-2">{[-30, -20, -10, 10].map((value) => <Button key={value} variant={shockPct === value ? "default" : "outline"} onClick={() => setShockPct(value)}>{value < 0 ? `افت ${Math.abs(value)}٪` : `رشد ${value}٪`}</Button>)}</div><div className="mt-4 rounded-2xl border bg-muted/20 p-4"><div className="type-strong">سناریو: {shockPct < 0 ? "افت" : "رشد"} {Math.abs(shockPct)}٪</div><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><ScenarioStat label="ارزش دارایی پس از شوک" value={formatMoney(stressedAssetValueToman, settings.displayUnit, true)}/><ScenarioStat label="اثر روی سرمایه" value={formatSignedMoney(shockDeltaToman, settings.displayUnit, true)} tone={shockDeltaToman >= 0 ? "profit" : "loss"}/><ScenarioStat label="معادل" value={`${shockInstallments.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} قسط`}/><ScenarioStat label="وضعیت" value={manageability}/></div></div><p className="mt-3 type-caption text-muted-foreground">اثر خالص پس از شوک: {formatSignedMoney(stressedNetEffectToman, settings.displayUnit, true)}</p></CardContent></Card>
  </div>;
}

function ScenarioStat({ label, value, tone }: { label: string; value: string; tone?: "profit" | "loss" }) { return <Card><CardContent className="p-4"><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-2 block type-card-title", tone === "profit" && "text-profit", tone === "loss" && "text-loss")}>{value}</SensitiveValue></CardContent></Card>; }
