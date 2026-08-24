"use client";

import {
  RiArrowLeftLine, RiArrowRightLine, RiBarChartBoxLine, RiHeart3Line, RiLineChartLine,
  RiScales3Line, RiShieldCheckLine, RiSkipForwardLine, RiWallet3Line,
} from "react-icons/ri";
import { BrandLogo } from "@/components/brand-logo";
import { ArcGauge } from "@/components/charts/arc-gauge";
import { OnboardingHoldingsStep } from "@/components/onboarding-holdings-step";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { lifestylePresets, ONBOARDING_STEPS, useOnboarding } from "@/hooks/use-onboarding";
import { formatMoney, formatPercent } from "@/lib/format";
import type { LifestylePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons = { growth: RiLineChartLine, balanced: RiScales3Line, comfort: RiHeart3Line, safety: RiShieldCheckLine };

export function Onboarding({ onDone }: { onDone: () => void }) {
  const state = useOnboarding(onDone);
  const stepNumber = new Intl.NumberFormat("fa-IR").format(state.step + 1);
  const totalSteps = new Intl.NumberFormat("fa-IR").format(ONBOARDING_STEPS);
  const canContinue = state.step !== 2 || state.total === 100;

  return <main className="min-h-svh bg-background p-2 sm:p-5"><div className="mx-auto flex min-h-[calc(100svh-1rem)] max-w-6xl flex-col overflow-hidden rounded-[30px] border bg-background/92 shadow-2xl sm:min-h-[calc(100svh-2.5rem)]">
    <header className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-7">
      <div className="flex items-center gap-3"><BrandLogo className="size-10" /><div className="hidden sm:block"><div className="type-caption text-muted-foreground">راه‌اندازی شخصی</div><div className="type-label">پولم‌کو</div></div></div>
      <div className="flex items-center gap-2"><span className="hidden text-xs text-muted-foreground sm:inline">مرحله {stepNumber} از {totalSteps}</span><Button type="button" size="sm" variant="ghost" onClick={() => void state.skip()} disabled={state.isSaving}><RiSkipForwardLine /> فعلاً ردش کن</Button></div>
    </header>
    <div className="h-1 bg-muted"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${((state.step + 1) / ONBOARDING_STEPS) * 100}%` }} /></div>

    <section className="flex-1 p-5 sm:p-8 lg:p-10">
      {state.step === 0 && <WelcomeStep />}
      {state.step === 1 && <LifestyleStep preset={state.preset} onChoose={state.choosePreset} />}
      {state.step === 2 && <AllocationStep state={state} />}
      {state.step === 3 && <SafetyStep state={state} />}
      {state.step === 4 && <OnboardingHoldingsStep assets={state.assets} holdings={state.holdings} settings={state.settings} onAdd={state.addHolding} onRemove={state.removeHolding} />}
      {state.step === 5 && <SummaryStep state={state} />}
      {state.error && <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>}
    </section>

    <footer className="flex items-center justify-between border-t p-4 sm:px-7"><Button variant="ghost" disabled={state.step === 0 || state.isSaving} onClick={() => state.setStep((step) => Math.max(0, step - 1))}><RiArrowRightLine /> قبلی</Button>{state.step < ONBOARDING_STEPS - 1 ? <Button disabled={!canContinue || state.isSaving} onClick={() => state.setStep((step) => Math.min(ONBOARDING_STEPS - 1, step + 1))}>{state.step === 0 ? "شروع تنظیم" : "ادامه"} <RiArrowLeftLine /></Button> : <Button disabled={state.isSaving} onClick={() => void state.finish()}>{state.isSaving ? "در حال ذخیره…" : "ورود به پولم‌کو"} <RiArrowLeftLine /></Button>}</footer>
  </div></main>;
}

function WelcomeStep() {
  return <div className="grid min-h-[520px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
    <div><Eyebrow>خوش آمدی</Eyebrow><h1 className="mt-3 max-w-2xl type-display">پولت را از همان چیزی که واقعاً داری شروع کن</h1><p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">در چند قدم کوتاه قانون پولت، حاشیه امن و دارایی‌های فعلی را مشخص می‌کنیم. اگر قبلاً دلار، طلا یا سرمایه‌گذاری داشته‌ای هم می‌توانی همان موجودی قبلی را وارد کنی.</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><IntroChip icon={RiScales3Line} title="قانون شخصی" text="درصدها را خودت تعیین کن" /><IntroChip icon={RiShieldCheckLine} title="حاشیه امن" text="هدف اضطراری واقع‌بینانه" /><IntroChip icon={RiWallet3Line} title="موجودی قبلی" text="شروع بدون صفر کردن گذشته" /></div><p className="mt-5 text-xs leading-6 text-muted-foreground">اگر عجله داری، «فعلاً ردش کن» بالای صفحه با تنظیمات پیشنهادی وارد برنامه‌ات می‌کند؛ بعداً از تنظیمات می‌توانی دوباره آنبوردینگ را اجرا کنی.</p></div>
    <div className="relative mx-auto grid w-full max-w-md place-items-center rounded-[32px] border bg-gradient-to-b from-primary/10 to-transparent p-8 sm:p-10"><div className="absolute end-5 top-5 rounded-full border bg-background/80 px-3 py-1 type-caption text-muted-foreground">شروع در چند دقیقه</div><div className="relative grid size-64 place-items-center rounded-full border border-primary/15 bg-background/80 shadow-xl"><div className="grid size-36 place-items-center rounded-full bg-primary/10"><BrandLogo className="size-24" /></div><FloatingIcon className="-start-3 top-10" icon={RiBarChartBoxLine} /><FloatingIcon className="-end-3 bottom-12" icon={RiShieldCheckLine} /><FloatingIcon className="start-12 -bottom-3" icon={RiWallet3Line} /></div></div>
  </div>;
}

function LifestyleStep({ preset, onChoose }: { preset: LifestylePreset; onChoose: (value: LifestylePreset) => void }) {
  return <div><Eyebrow>سبک زندگی</Eyebrow><h1 className="mt-2 type-display">می‌خواهی پولت چه نوع زندگی‌ای برایت بسازد؟</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">این فقط نقطه شروع است. درصدها هر زمان قابل تغییرند و قانون ثابتی به تو تحمیل نمی‌شود.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{lifestylePresets.map((item) => { const Icon = icons[item.id]; const active = preset === item.id; return <button key={item.id} type="button" onClick={() => onChoose(item.id)} className={cn("rounded-2xl border p-5 text-start transition", active ? "border-primary bg-primary/7 ring-2 ring-primary/15" : "bg-card hover:bg-accent/55")}><div className="flex items-start justify-between gap-4"><div><h3 className="type-strong">{item.title}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">{item.desc}</p></div><div className={cn("grid size-10 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-muted")}><Icon className="size-5" /></div></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs"><StatMini label="زندگی" value={item.life} /><StatMini label="امنیت" value={item.safety} /><StatMini label="رشد" value={item.growth} /></div></button>; })}</div></div>;
}

function AllocationStep({ state }: { state: ReturnType<typeof useOnboarding> }) {
  return <div className="grid gap-8 lg:grid-cols-[1fr_300px]"><div><Eyebrow>قانون پول من</Eyebrow><h2 className="mt-2 type-page-title">درصدها را برای خودت تنظیم کن</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">جمع سه بخش باید دقیقاً ۱۰۰٪ باشد.</p><div className="mt-7 space-y-6"><AllocationSlider label="زندگی" description="خرج جاری و کیفیت زندگی" value={state.life} onChange={(value) => state.adjust("life", value)} /><AllocationSlider label="امنیت" description="اضطراری و هزینه‌های پیش‌رو" value={state.safety} onChange={(value) => state.adjust("safety", value)} /><AllocationSlider label="رشد" description="سرمایه‌گذاری و ساخت دارایی" value={state.growth} onChange={(value) => state.adjust("growth", value)} /></div><div className={cn("mt-6 rounded-xl border p-3 text-sm", state.total === 100 ? "border-primary/20 bg-primary/5" : "border-destructive/25 bg-destructive/5 text-destructive")}>جمع: {formatPercent(state.total, 0)} {state.total !== 100 && ` — ${state.total > 100 ? "باید کم شود" : "هنوز تخصیص داده نشده"}`}</div></div><div className="grid place-items-center"><ArcGauge value={state.gauge} label="امنیت + رشد" size={230} stroke={28} gapRatio={0} /></div></div>;
}

function SafetyStep({ state }: { state: ReturnType<typeof useOnboarding> }) {
  return <div><Eyebrow>حاشیه امن</Eyebrow><h2 className="mt-2 type-page-title">اگر درآمد متوقف شود، چند ماه می‌خواهی آرامش داشته باشی؟</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="هزینه ضروری ماهانه"><MoneyInput value={state.monthly} onValueChange={state.setMonthly} unit={state.displayUnit} /></Field><Field label="هدف صندوق اضطراری"><Select value={state.months} onValueChange={state.setMonths} options={[1, 3, 6, 9, 12].map((value) => ({ value: String(value), label: `${new Intl.NumberFormat("fa-IR").format(value)} ماه` }))} /></Field><Field label="ثبات درآمد"><Select value={state.stability} onValueChange={state.setStability} options={[{ value: "stable", label: "تقریباً ثابت" }, { value: "variable", label: "متغیر" }, { value: "irregular", label: "خیلی نامنظم" }]} /></Field><Field label="تحمل نوسان سرمایه"><Select value={state.risk} onValueChange={state.setRisk} options={[{ value: "low", label: "کم" }, { value: "medium", label: "متوسط" }, { value: "high", label: "زیاد" }]} /></Field></div>{state.monthly && <Card className="mt-6 soft-card p-5"><div className="type-body text-muted-foreground">هدف اولیه صندوق اضطراری</div><div className="mt-1 type-page-title">{formatMoney(state.monthly * Number(state.months), state.displayUnit)}</div></Card>}</div>;
}

function SummaryStep({ state }: { state: ReturnType<typeof useOnboarding> }) {
  return <div className="grid gap-7 lg:grid-cols-[1fr_320px]"><div><Eyebrow>جمع‌بندی</Eyebrow><h2 className="mt-2 type-page-title">قانون اولیه آماده است</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">هر بار پولی وارد شود، پولم‌کو ابتدا امنیت و هزینه‌های نزدیک را می‌سنجد و سپس همین قانون را برای پیشنهاد تقسیم به کار می‌برد. {state.holdings.length ? `${new Intl.NumberFormat("fa-IR").format(state.holdings.length)} موجودی قبلی هم به سبدت اضافه می‌شود.` : "موجودی قبلی هم هر زمان قابل اضافه‌کردن است."}</p><div className="mt-7 grid grid-cols-3 gap-3"><SummaryBox title="زندگی" value={state.life} /><SummaryBox title="امنیت" value={state.safety} /><SummaryBox title="رشد" value={state.growth} /></div></div><div className="grid place-items-center"><ArcGauge value={100} label="راه‌اندازی کامل" size={230} stroke={28} gapRatio={0} /></div></div>;
}

function IntroChip({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) { return <div className="rounded-2xl border bg-card/70 p-4"><Icon className="size-5 text-primary" /><div className="mt-3 type-strong">{title}</div><div className="mt-1 type-caption text-muted-foreground">{text}</div></div>; }
function FloatingIcon({ icon: Icon, className }: { icon: React.ComponentType<{ className?: string }>; className: string }) { return <div className={cn("absolute grid size-12 place-items-center rounded-2xl border bg-background shadow-lg", className)}><Icon className="size-5 text-primary" /></div>; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="text-xs type-strong text-primary">{children}</div>; }
function StatMini({ label, value }: { label: string; value: number }) { return <div className="rounded-lg bg-muted/70 p-2"><div className="type-strong">{formatPercent(value, 0)}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div></div>; }
function AllocationSlider({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (value: number) => void }) { return <div><div className="mb-2 flex items-end justify-between"><div><div className="type-strong">{label}</div><div className="type-caption text-muted-foreground">{description}</div></div><div className="type-section-title text-primary">{formatPercent(value, 0)}</div></div><Slider value={[value]} onValueChange={([next]) => onChange(next)} min={0} max={80} step={5} /></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}</div>; }
function SummaryBox({ title, value }: { title: string; value: number }) { return <div className="rounded-2xl border bg-card p-4 text-center"><div className="text-2xl type-strong text-primary">{formatPercent(value, 0)}</div><div className="mt-1 type-caption text-muted-foreground">{title}</div></div>; }
