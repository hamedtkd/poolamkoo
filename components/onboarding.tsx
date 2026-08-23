"use client";

import { RiArrowLeftLine, RiArrowRightLine, RiHeart3Line, RiLineChartLine, RiScales3Line, RiShieldCheckLine } from "react-icons/ri";
import { ArcGauge } from "@/components/charts/arc-gauge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { lifestylePresets, useOnboarding } from "@/hooks/use-onboarding";
import { formatPercent } from "@/lib/format";
import type { LifestylePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons = { growth: RiLineChartLine, balanced: RiScales3Line, comfort: RiHeart3Line, safety: RiShieldCheckLine };

export function Onboarding({ onDone }: { onDone: () => void }) {
  const state = useOnboarding(onDone);
  return <main className="min-h-svh p-3 sm:p-6"><div className="mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-5xl flex-col rounded-[32px] border bg-background/88 shadow-2xl backdrop-blur-xl sm:min-h-[calc(100svh-3rem)]">
    <header className="flex items-center justify-between border-b px-5 py-4 sm:px-8"><div><div className="text-xl font-black">پولم‌کو</div><div className="text-xs text-muted-foreground">راه‌اندازی قانون پول شخصی</div></div><div className="text-xs text-muted-foreground">مرحله {new Intl.NumberFormat("fa-IR").format(state.step + 1)} از ۴</div></header>
    <div className="h-1 bg-muted"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${((state.step + 1) / 4) * 100}%` }} /></div>
    <section className="flex-1 p-5 sm:p-8 lg:p-10">
      {state.step === 0 && <LifestyleStep preset={state.preset} onChoose={state.choosePreset} />}
      {state.step === 1 && <AllocationStep state={state} />}
      {state.step === 2 && <SafetyStep state={state} />}
      {state.step === 3 && <SummaryStep state={state} />}
      {state.error && <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>}
    </section>
    <footer className="flex items-center justify-between border-t p-4 sm:px-8"><Button variant="ghost" disabled={state.step === 0} onClick={() => state.setStep((step) => Math.max(0, step - 1))}><RiArrowRightLine /> قبلی</Button>{state.step < 3 ? <Button disabled={state.step === 1 && state.total !== 100} onClick={() => state.setStep((step) => Math.min(3, step + 1))}>ادامه <RiArrowLeftLine /></Button> : <Button onClick={() => void state.finish()}>ورود به پولم‌کو <RiArrowLeftLine /></Button>}</footer>
  </div></main>;
}

function LifestyleStep({ preset, onChoose }: { preset: LifestylePreset; onChoose: (value: LifestylePreset) => void }) {
  return <div><Eyebrow>سبک زندگی</Eyebrow><h1 className="mt-2 text-3xl font-black sm:text-4xl">می‌خواهی پولت چه نوع زندگی‌ای برایت بسازد؟</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">این فقط نقطه شروع است. درصدها هر زمان قابل تغییرند و قانون ثابتی به تو تحمیل نمی‌شود.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{lifestylePresets.map((item) => { const Icon = icons[item.id]; const active = preset === item.id; return <button key={item.id} type="button" onClick={() => onChoose(item.id)} className={cn("rounded-2xl border p-5 text-start transition", active ? "border-primary bg-primary/7 ring-2 ring-primary/15" : "bg-card hover:bg-accent/55")}><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">{item.title}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">{item.desc}</p></div><div className={cn("grid size-10 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted")}><Icon className="size-5" /></div></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs"><StatMini label="زندگی" value={item.life} /><StatMini label="امنیت" value={item.safety} /><StatMini label="رشد" value={item.growth} /></div></button>; })}</div></div>;
}

function AllocationStep({ state }: { state: ReturnType<typeof useOnboarding> }) {
  return <div className="grid gap-8 lg:grid-cols-[1fr_300px]"><div><Eyebrow>قانون پول من</Eyebrow><h2 className="mt-2 text-3xl font-black">درصدها را برای خودت تنظیم کن</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">جمع سه بخش باید دقیقاً ۱۰۰٪ باشد.</p><div className="mt-7 space-y-6"><AllocationSlider label="زندگی" description="خرج جاری و کیفیت زندگی" value={state.life} onChange={(value) => state.adjust("life", value)} /><AllocationSlider label="امنیت" description="اضطراری و هزینه‌های پیش‌رو" value={state.safety} onChange={(value) => state.adjust("safety", value)} /><AllocationSlider label="رشد" description="سرمایه‌گذاری و ساخت دارایی" value={state.growth} onChange={(value) => state.adjust("growth", value)} /></div><div className={cn("mt-6 rounded-xl border p-3 text-sm", state.total === 100 ? "border-primary/20 bg-primary/5" : "border-destructive/25 bg-destructive/5 text-destructive")}>جمع: {formatPercent(state.total, 0)} {state.total !== 100 && ` — ${state.total > 100 ? "باید کم شود" : "هنوز تخصیص داده نشده"}`}</div></div><div className="grid place-items-center"><ArcGauge value={state.gauge} label="تمرکز روی آینده" size={230} stroke={28} /></div></div>;
}

function SafetyStep({ state }: { state: ReturnType<typeof useOnboarding> }) {
  return <div><Eyebrow>حاشیه امن</Eyebrow><h2 className="mt-2 text-3xl font-black">اگر درآمد متوقف شود، چند ماه می‌خواهی آرامش داشته باشی؟</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="هزینه ضروری ماهانه"><MoneyInput value={state.monthly} onValueChange={state.setMonthly} unit="toman" /></Field><Field label="هدف صندوق اضطراری"><Select value={state.months} onValueChange={state.setMonths} options={[1, 3, 6, 9, 12].map((value) => ({ value: String(value), label: `${new Intl.NumberFormat("fa-IR").format(value)} ماه` }))} /></Field><Field label="ثبات درآمد"><Select value={state.stability} onValueChange={state.setStability} options={[{ value: "stable", label: "تقریباً ثابت" }, { value: "variable", label: "متغیر" }, { value: "irregular", label: "خیلی نامنظم" }]} /></Field><Field label="تحمل نوسان سرمایه"><Select value={state.risk} onValueChange={state.setRisk} options={[{ value: "low", label: "کم" }, { value: "medium", label: "متوسط" }, { value: "high", label: "زیاد" }]} /></Field></div>{state.monthly && <Card className="mt-6 soft-card p-5"><div className="text-sm text-muted-foreground">هدف اولیه صندوق اضطراری</div><div className="mt-1 text-3xl font-black">{new Intl.NumberFormat("fa-IR").format(state.monthly * Number(state.months))} <span className="text-sm font-medium text-muted-foreground">تومان</span></div></Card>}</div>;
}

function SummaryStep({ state }: { state: ReturnType<typeof useOnboarding> }) { return <div className="grid gap-7 lg:grid-cols-[1fr_320px]"><div><Eyebrow>جمع‌بندی</Eyebrow><h2 className="mt-2 text-3xl font-black">قانون اولیه آماده است</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">هر بار پولی وارد شود، پولم‌کو ابتدا امنیت و هزینه‌های نزدیک را می‌سنجد و سپس همین قانون را برای پیشنهاد تقسیم به کار می‌برد.</p><div className="mt-7 grid grid-cols-3 gap-3"><SummaryBox title="زندگی" value={state.life} /><SummaryBox title="امنیت" value={state.safety} /><SummaryBox title="رشد" value={state.growth} /></div></div><div className="grid place-items-center"><ArcGauge value={100} label="راه‌اندازی کامل" size={230} stroke={28} /></div></div>; }

function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="text-xs font-bold text-primary">{children}</div>; }
function StatMini({ label, value }: { label: string; value: number }) { return <div className="rounded-lg bg-muted/70 p-2"><div className="font-bold">{formatPercent(value, 0)}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div></div>; }
function AllocationSlider({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (value: number) => void }) { return <div><div className="mb-2 flex items-end justify-between"><div><div className="font-bold">{label}</div><div className="text-xs text-muted-foreground">{description}</div></div><div className="text-xl font-black text-primary">{formatPercent(value, 0)}</div></div><Slider value={[value]} onValueChange={([next]) => onChange(next)} min={0} max={80} step={5} /></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><label className="text-sm font-bold">{label}</label>{children}</div>; }
function SummaryBox({ title, value }: { title: string; value: number }) { return <div className="rounded-2xl border bg-card p-4 text-center"><div className="text-2xl font-black text-primary">{formatPercent(value, 0)}</div><div className="mt-1 text-xs text-muted-foreground">{title}</div></div>; }
