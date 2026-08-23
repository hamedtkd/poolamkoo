"use client";

import { RiAddLine, RiArrowUpLine, RiCloudLine, RiRefreshLine, RiShieldCheckLine, RiWallet3Line } from "react-icons/ri";
import type { AllocationRule, AppSettings, Asset, GoalFund, IncomeEvent, InvestmentTransaction, MarketQuote, MarketSnapshot, MoneyUnit, PlanItem } from "@/lib/types";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { formatMoney, formatPercent, toPersianDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArcGauge } from "@/components/charts/arc-gauge";
import { Sparkline } from "@/components/charts/sparkline";
import { PortfolioAreaChart } from "@/components/charts/portfolio-area-chart";
import { cn } from "@/lib/utils";
import { incomePlanProgress } from "@/lib/plan-execution";

export function DashboardSection({ settings, rule, incomes, funds, assets, transactions, quotes, snapshots, marketMode, marketLoading, marketLastUpdated, marketWarning, planItems, onRefreshMarket, onNewMoney, onOpenInvestments, onOpenFunds }: {
  settings: AppSettings; rule?: AllocationRule; incomes: IncomeEvent[]; funds: GoalFund[]; assets: Asset[]; transactions: InvestmentTransaction[]; quotes: MarketQuote[]; snapshots: MarketSnapshot[]; marketMode: string; marketLoading: boolean; marketLastUpdated: string | null; marketWarning?: string; planItems: PlanItem[]; onRefreshMarket: () => void; onNewMoney: () => void; onOpenInvestments: () => void; onOpenFunds: () => void;
}) {
  const unit = settings.displayUnit;
  const metrics = useDashboardMetrics({ rule, incomes, funds, assets, transactions, quotes });
  const { positions, portfolio, pnl, pnlPct, monthIncome, monthIncomeCount, emergency, emergencyPct, decisionGauge, chartData } = metrics;
  const planProgress = incomePlanProgress(planItems);

  return <div className="space-y-4 sm:space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-semibold text-primary">نمای کلی</div><h1 className="mt-1 text-2xl font-black sm:text-3xl">سلام، امروز پولت کجاست؟</h1><p className="mt-1 text-sm text-muted-foreground">یک نگاه سریع به تصمیم‌های مالی، صندوق‌ها و بازار.</p></div><Button onClick={onNewMoney} size="lg" className="w-full sm:w-auto"><RiAddLine className="size-5" /> پول جدید دارم</Button></div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard icon={<RiWallet3Line/>} label="سرمایه فعلی" value={formatMoney(portfolio, unit)} sub={pnl >= 0 ? `${formatPercent(pnlPct)} نسبت به بهای خرید` : `${formatPercent(Math.abs(pnlPct))} افت نسبت به بهای خرید`} positive={pnl >= 0} />
      <SummaryCard icon={<RiArrowUpLine/>} label="سود / زیان باز" value={formatMoney(pnl, unit)} sub={pnl >= 0 ? "ارزش فعلی بالاتر از بهای خرید" : "بازده فعلی منفی است"} positive={pnl >= 0}/>
      <SummaryCard icon={<RiAddLine/>} label="پول ورودی این ماه" value={formatMoney(monthIncome, unit)} sub={`${new Intl.NumberFormat("fa-IR").format(monthIncomeCount)} ورودی ثبت شده`} />
      <SummaryCard icon={<RiShieldCheckLine/>} label="حاشیه امن" value={emergency ? formatMoney(emergency.currentToman, unit) : "هنوز نساختی"} sub={emergency ? `${formatPercent(emergencyPct)} از هدف اضطراری` : "از بخش صندوق‌ها شروع کن"} positive />
      <SummaryCard icon={<RiShieldCheckLine/>} label={"\u067e\u0627\u06cc\u0628\u0646\u062f\u06cc \u0628\u0647 \u0628\u0631\u0646\u0627\u0645\u0647"} value={formatPercent(planProgress.pct, 0)} sub={`${formatMoney(planProgress.executed, unit, true)} / ${formatMoney(planProgress.planned, unit, true)}`} positive={planProgress.pct >= 80} />
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.05fr_1.95fr]">
      <Card className="overflow-hidden"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>قانون پول فعلی</CardTitle><p className="mt-1 text-xs text-muted-foreground">{rule?.name ?? "بدون قانون فعال"}</p></div><Badge>{rule?.preset === "custom" ? "شخصی" : "پیشنهادی"}</Badge></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-[210px_1fr] sm:items-center"><div className="mx-auto"><ArcGauge value={Math.min(100, decisionGauge)} label="تمرکز روی امنیت + رشد" size={190} stroke={23}/></div><div className="space-y-3">{rule && <><AllocationRow label="زندگی" value={rule.lifePct}/><AllocationRow label="امنیت" value={rule.safetyPct}/><AllocationRow label="رشد" value={rule.growthPct}/></>}</div></div></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle>روند سرمایه واردشده</CardTitle><p className="mt-1 text-xs text-muted-foreground">جمع خالص خریدهای ثبت‌شده در شش ماه اخیر؛ بدون ساختن تاریخچه قیمت مصنوعی</p></div><Button variant="ghost" size="sm" onClick={onOpenInvestments}>جزئیات</Button></CardHeader><CardContent><PortfolioAreaChart data={chartData} unit={unit}/></CardContent></Card>
    </div>

    <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>بازارهای منتخب</CardTitle><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><RiCloudLine/><span>{marketMode === "live" ? "داده واقعی BrsApi" : marketMode === "offline" ? "آخرین داده واقعی ذخیره‌شده روی دستگاه" : marketMode === "unconfigured" ? "کلید BrsApi تنظیم نشده است" : "داده بازار در دسترس نیست"}</span>{marketLastUpdated && <span>· {new Intl.DateTimeFormat("fa-IR-u-ca-persian", { hour: "2-digit", minute: "2-digit", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(marketLastUpdated))}</span>}{marketWarning && <span className="text-destructive">· {marketWarning}</span>}</div></div><Button variant="outline" size="icon" onClick={onRefreshMarket} disabled={marketLoading}><RiRefreshLine className={cn("size-4", marketLoading && "animate-spin")}/></Button></CardHeader><CardContent><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{quotes.length ? quotes.slice(0,4).map((q) => <MarketCard key={q.symbol} quote={q} unit={unit} snapshots={snapshots.filter((row) => row.symbol === q.symbol).slice(0, 24).reverse()}/>) : <div className="col-span-full py-8 text-center text-sm text-muted-foreground">در حال دریافت قیمت بازار...</div>}</div></CardContent></Card>

    <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>صندوق‌های هدف</CardTitle><p className="mt-1 text-xs text-muted-foreground">هزینه‌هایی که بهتر است قبل از رسیدنشان برایشان پول کنار بگذاری</p></div><Button variant="ghost" size="sm" onClick={onOpenFunds}>همه صندوق‌ها</Button></CardHeader><CardContent><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{funds.slice(0,3).map((fund) => <FundPreview key={fund.id} fund={fund} unit={unit}/>)}</div></CardContent></Card>
      <Card className="soft-card"><CardHeader><CardTitle>بینش این ماه</CardTitle></CardHeader><CardContent><div className="space-y-3 text-sm leading-7"><InsightDot>{emergency && emergencyPct < 100 ? `برای تکمیل صندوق اضطراری حدود ${formatMoney(Math.max(0, emergency.targetToman - emergency.currentToman), unit)} فاصله داری.` : "صندوق اضطراری در وضعیت مناسبی است."}</InsightDot><InsightDot>{positions.some((item) => item.currentValue > 0) ? `${positions.filter((item) => item.currentValue > 0).sort((a,b)=>b.currentValue-a.currentValue)[0].asset.name} بیشترین سهم ارزش فعلی سبد را دارد.` : "اولین خرید واقعی را ثبت کن تا تحلیل سبد شروع شود."}</InsightDot><InsightDot>پیشنهادهای پولم‌کو از «پول جدید» برای نزدیک‌شدن به تخصیص هدف استفاده می‌کنند.</InsightDot></div></CardContent></Card>
    </div>
  </div>;
}

function SummaryCard({ icon, label, value, sub, positive }: { icon: React.ReactNode; label: string; value: string; sub: string; positive?: boolean }) { return <Card><CardContent className="p-4 sm:p-5"><div className="flex items-start justify-between"><div><div className="text-xs text-muted-foreground">{label}</div><div className="mt-2 text-xl font-black tabular-nums sm:text-2xl">{value}</div></div><div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</div></div><div className={cn("mt-3 text-[11px]", positive === false ? "text-destructive" : "text-muted-foreground")}>{sub}</div></CardContent></Card>; }
function AllocationRow({ label, value }: { label: string; value: number }) { return <div><div className="mb-1.5 flex justify-between text-xs"><span>{label}</span><strong>{formatPercent(value,0)}</strong></div><Progress value={value}/></div>; }
function MarketCard({ quote, unit, snapshots }: { quote: MarketQuote; unit: MoneyUnit; snapshots: MarketSnapshot[] }) { const positive = quote.changePercent >= 0; const seed = snapshots.length > 1 ? snapshots.map((row) => row.priceToman) : [quote.priceToman, quote.priceToman]; return <div className="rounded-2xl border bg-background/60 p-3"><div className="flex items-center justify-between"><div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>{quote.name}</span></div><div className="mt-1 font-black">{formatMoney(quote.priceToman, unit, true)}</div></div><div className={cn("rounded-lg px-2 py-1 text-[10px] font-bold", positive ? "bg-primary/9 text-primary" : "bg-destructive/10 text-destructive")}>{positive ? "+" : ""}{formatPercent(quote.changePercent)}</div></div><Sparkline data={seed} positive={positive}/></div>; }
function FundPreview({ fund, unit }: { fund: GoalFund; unit: MoneyUnit }) { const pct = fund.targetToman ? Math.min(100, fund.currentToman/fund.targetToman*100) : 0; return <div className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-2"><strong className="text-sm">{fund.name}</strong><span className="text-xs font-bold text-primary">{formatPercent(pct,0)}</span></div><Progress value={pct} className="mt-3"/><div className="mt-3 flex justify-between text-[10px] text-muted-foreground"><span>{formatMoney(fund.currentToman, unit, true)}</span><span>{fund.dueAt ? toPersianDate(fund.dueAt) : "بدون موعد"}</span></div></div>; }
function InsightDot({ children }: { children: React.ReactNode }) { return <div className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"/><span>{children}</span></div>; }
