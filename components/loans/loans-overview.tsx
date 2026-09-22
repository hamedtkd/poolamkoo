"use client";

import Link from "next/link";
import { RiAddLine, RiAlertLine, RiBankCardLine, RiCalendarCheckLine, RiShieldCheckLine } from "react-icons/ri";
import { Reveal, RevealGrid } from "@/components/animation/reveal";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { Progress } from "@/components/ui/progress";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { buildLoanViews } from "@/lib/loans/analytics";
import type { LoanRiskControls } from "@/hooks/use-loan-risk";
import { formatMoney, formatSignedMoney, toPersianDate } from "@/lib/format";
import type { AppSettings, Asset, FundMovement, GoalFund, InvestmentTransaction, Loan, LoanPayment, MarketQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LoansOverview({ settings, loans, payments, funds, assets, transactions, fundMovements, quotes, loanRisk }: {
  settings: AppSettings; loans: Loan[]; payments: LoanPayment[]; funds: GoalFund[]; assets: Asset[]; transactions: InvestmentTransaction[]; fundMovements: FundMovement[]; quotes: MarketQuote[]; loanRisk: LoanRiskControls;
}) {
  const views = buildLoanViews({ loans, payments, funds, assets, transactions, fundMovements, quotes });
  const active = views.filter((row) => row.loan.status === "active");
  if (!loans.length) return <EmptyLoans />;
  const outstanding = active.reduce((sum, row) => sum + row.outstandingPrincipalToman, 0);
  const nextMonth = active.reduce((sum, row) => sum + (row.nextInstallment?.amountToman ?? 0), 0);
  const runway = active.length ? Math.min(...active.map((row) => row.reserveRunwayMonths)) : 0;
  const attention = active.filter((row) => loanRisk.forLoan(row.loan.id)?.level !== "healthy").length;

  return <div className="space-y-4 sm:space-y-5">
    <Reveal direction="down"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="type-caption type-body-strong text-primary">وام و تعهد</div><h1 className="mt-1 type-page-title">بازپرداخت را قبل از بازده ببین</h1><p className="mt-1 type-body text-muted-foreground">تعهد، ذخیره و سرمایه‌ای که با پول قرضی ساخته‌ای جدا از درآمد عادی دنبال می‌شود.</p></div><Link href="/loans/new" className={buttonStyles({ size: "lg" })}><RiAddLine /> ثبت وام</Link></div></Reveal>
    <RevealGrid className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi icon={<RiBankCardLine />} label="مانده بدهی فعال" value={formatMoney(outstanding, settings.displayUnit, true)} />
      <Kpi icon={<RiCalendarCheckLine />} label="اقساط بعدی" value={formatMoney(nextMonth, settings.displayUnit, true)} />
      <Kpi icon={<RiShieldCheckLine />} label="کمترین پوشش ذخیره" value={`${runway.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} قسط`} />
      <Kpi icon={<RiAlertLine />} label="نیازمند توجه" value={`${attention.toLocaleString("fa-IR")} وام`} danger={attention > 0} />
    </RevealGrid>
    <div className="grid gap-3 lg:grid-cols-2">{views.map((view, index) => <Reveal key={view.loan.id} step={index + 2}><LoanCard view={view} unit={settings.displayUnit} risk={loanRisk}/></Reveal>)}</div>
  </div>;
}

function EmptyLoans() {
  return <Reveal direction="down"><Card className="overflow-hidden"><CardContent className="grid min-h-[420px] place-items-center p-6 text-center"><div className="max-w-xl"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><RiBankCardLine className="size-7" /></div><h1 className="mt-5 type-page-title">وام داری؟ اول تعهدش را ببین، بعد بازدهش را.</h1><p className="mx-auto mt-3 max-w-lg type-body leading-7 text-muted-foreground">شرایط وام را ثبت کن تا قسط، ذخیره امن، نقطه سر به سر و سرمایه متصل به آن جدا از درآمد عادی دنبال شود.</p><div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><Link href="/loans/new" className={buttonStyles({ size: "lg" })}><RiAddLine /> ثبت اولین وام</Link><Link href="/loans/new" className={buttonStyles({ variant: "outline", size: "lg" })}>محاسبه قبل از ثبت</Link></div></div></CardContent></Card></Reveal>;
}

function LoanCard({ view, unit, risk }: { view: ReturnType<typeof buildLoanViews>[number]; unit: AppSettings["displayUnit"]; risk: LoanRiskControls }) {
  const next = view.nextInstallment;
  const health = risk.forLoan(view.loan.id);
  const tone = view.loan.status === "closed" ? "safe" : health?.level === "critical" ? "critical" : health?.level === "watch" ? "attention" : "safe";
  return <Card className={cn("h-full", tone === "critical" && "border-destructive/35", tone === "attention" && "border-amber-500/35")}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{view.loan.name}</CardTitle><p className="mt-1 type-caption text-muted-foreground">{view.loan.lender || "بدون نام وام‌دهنده"}</p></div><Badge className={cn(tone === "critical" && "border-destructive/25 bg-destructive/8 text-destructive", tone === "attention" && "border-amber-500/25 bg-amber-500/8", tone === "safe" && "border-primary/20 bg-primary/8 text-primary")}>{view.loan.status === "closed" ? "پایان‌یافته" : health?.level === "critical" ? "نیازمند اقدام" : health?.level === "watch" ? "احتیاط" : "در محدوده"}</Badge></div></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3"><Metric label="قسط بعدی" value={next ? formatMoney(next.amountToman, unit, true) : "تمام شده"} sub={next ? `${toPersianDate(next.dueAt)} · ${dayText(next.daysRemaining)}` : undefined}/><Metric label="مانده اصل" value={formatMoney(view.outstandingPrincipalToman, unit, true)} sub={`${view.paidInstallments.toLocaleString("fa-IR")} از ${view.loan.termMonths.toLocaleString("fa-IR")} قسط`} /></div><div className="rounded-2xl border bg-muted/20 p-3"><div className="flex items-center justify-between gap-3"><span className="type-caption text-muted-foreground">ذخیره بازپرداخت</span><SensitiveValue className="type-strong">{view.reserveRunwayMonths.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} قسط</SensitiveValue></div><Progress value={view.reserveProgressPct} className="mt-2"/><div className="mt-2 flex items-center justify-between gap-3 type-caption text-muted-foreground"><SensitiveValue>{formatMoney(view.reserveBalanceToman, unit, true)}</SensitiveValue><span>هدف {view.loan.reserveTargetMonths.toLocaleString("fa-IR")} قسط</span></div></div><div className="flex items-center justify-between gap-3 border-t pt-3"><div><div className="type-caption text-muted-foreground">اثر خالص استراتژی</div><SensitiveValue className={cn("mt-1 type-strong", view.netStrategyEffectToman > 0 && "text-profit", view.netStrategyEffectToman < 0 && "text-loss")}>{formatSignedMoney(view.netStrategyEffectToman, unit, true)}</SensitiveValue></div><Link href={`/loans/${view.loan.id}`} className={buttonStyles({ variant: "outline" })}>مشاهده و مدیریت</Link></div></CardContent></Card>;
}

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) { return <div><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className="mt-1 block type-strong tabular-nums">{value}</SensitiveValue>{sub && <div className="mt-1 type-caption text-muted-foreground">{sub}</div>}</div>; }
function Kpi({ icon, label, value, danger = false }: { icon: React.ReactNode; label: string; value: string; danger?: boolean }) { return <Card><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-2 block type-section-title", danger && "text-destructive")}>{value}</SensitiveValue></div><KpiIcon tone={danger ? "danger" : "primary"}>{icon}</KpiIcon></div></CardContent></Card>; }
function dayText(days: number) { if (days < 0) return `${Math.abs(days).toLocaleString("fa-IR")} روز گذشته`; if (days === 0) return "امروز"; return `${days.toLocaleString("fa-IR")} روز مانده`; }
