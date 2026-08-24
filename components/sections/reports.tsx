"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RiArrowDownLine, RiArrowUpLine, RiFileList3Line, RiMoneyDollarCircleLine, RiSafe2Line } from "react-icons/ri";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { MonthlyBars } from "@/components/charts/monthly-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpLabel } from "@/components/ui/help-label";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { useReportsData, type PerformanceRow, type PlanAdherenceRow } from "@/hooks/use-reports-data";
import { formatMoney, formatPercent } from "@/lib/format";
import type { AllocationEntry, AllocationRule, AppSettings, Asset, GoalFund, IncomeEvent, InvestmentTransaction, MarketQuote, PlanItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const HELP = {
  adherence: "درصد مبلغی که برای پول‌های ورودی برنامه‌ریزی کرده‌ای و واقعاً اجرای آن را ثبت کرده‌ای.",
  funds: "موجودی فعلی همه صندوق‌ها تقسیم بر مجموع هدف صندوق‌ها.",
  return: "بازده از میانگین قیمت خرید واقعی شما تا قیمت فعلی بازار محاسبه می‌شود؛ این عدد تغییر روزانه بازار نیست.",
  target: "سهمی که برای این دارایی در تنظیمات سبد به‌عنوان هدف تعیین کرده‌ای.",
  actual: "سهم ارزش فعلی این دارایی از کل ارزش فعلی سبد سرمایه‌گذاری شما.",
  drift: "سهم فعلی منهای سهم هدف. مثبت یعنی دارایی بیش از هدف وزن گرفته و منفی یعنی کمتر از هدف است.",
  value: "ارزش فعلی دارایی بر اساس مقدار واقعی ثبت‌شده و آخرین قیمت بازار.",
  allocation: "نشان می‌دهد کل پول‌های ثبت‌شده تا امروز بین زندگی، امنیت و رشد چگونه برنامه‌ریزی شده‌اند.",
  monthly: "تقسیم پول‌های ورودی در شش ماه اخیر. اگر ماهی ورودی نداشته باشد چیزی برای رسم وجود ندارد.",
};

export function ReportsSection({ settings, rule, incomes, allocations, funds, assets, transactions, quotes, planItems }: {
  settings: AppSettings; rule?: AllocationRule; incomes: IncomeEvent[]; allocations: AllocationEntry[]; funds: GoalFund[];
  assets: Asset[]; transactions: InvestmentTransaction[]; quotes: MarketQuote[]; planItems: PlanItem[];
}) {
  const report = useReportsData({ incomes, allocations, funds, assets, transactions, quotes, planItems });
  const { performance: perf, totalIncome, totals, funded, target, best, worst, monthly, overallPlan, planRows } = report;
  const planColumns: ColumnDef<DataTableFeatures, PlanAdherenceRow, unknown>[] = [
    { accessorKey: "title", header: "پول ورودی", cell: ({ row }) => <strong>{row.original.title}</strong> },
    { accessorKey: "planned", header: "برنامه", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.planned, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "executed", header: "اجراشده", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.executed, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "pct", header: () => <HelpLabel label="پایبندی" help={HELP.adherence} />, cell: ({ row }) => <SensitiveValue className={cn("type-strong", row.original.pct >= 90 ? "text-primary" : row.original.pct < 50 ? "text-destructive" : "")}>{formatPercent(row.original.pct, 0)}</SensitiveValue> },
  ];
  const columns: ColumnDef<DataTableFeatures, PerformanceRow, unknown>[] = [
    { accessorKey: "name", header: "دارایی", cell: ({ row }) => <strong>{row.original.name}</strong> },
    { accessorKey: "value", header: () => <HelpLabel label="ارزش فعلی" help={HELP.value} />, cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.value, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "target", header: () => <HelpLabel label="هدف" help={HELP.target} />, cell: ({ row }) => <SensitiveValue>{formatPercent(row.original.target, 0)}</SensitiveValue> },
    { accessorKey: "actual", header: () => <HelpLabel label="سهم فعلی" help={HELP.actual} />, cell: ({ row }) => <SensitiveValue>{formatPercent(row.original.actual, 1)}</SensitiveValue> },
    { id: "drift", header: () => <HelpLabel label="فاصله از هدف" help={HELP.drift} />, cell: ({ row }) => <DriftValue value={row.original.actual - row.original.target} /> },
    { accessorKey: "pnlPct", header: () => <HelpLabel label="بازده از خرید" help={HELP.return} />, cell: ({ row }) => <ReturnValue row={row.original} settings={settings} /> },
  ];

  return <div className="space-y-5">
    <div><div className="type-caption type-body-strong text-primary">تحلیل</div><h1 className="mt-1 type-page-title">گزارش‌ها و بینش‌ها</h1><p className="mt-1 type-body text-muted-foreground">اعداد بازده این صفحه مربوط به خریدهای واقعی خودت هستند، نه تغییر قیمت بازار از دیروز.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <InsightCard icon={<RiMoneyDollarCircleLine />} label="کل پول ورودی" value={formatMoney(totalIncome, settings.displayUnit)} detail={`${new Intl.NumberFormat("fa-IR").format(incomes.length)} ورودی ثبت‌شده`} />
      <InsightCard icon={<RiFileList3Line />} iconTone={overallPlan.pct >= 80 ? "primary" : "neutral"} label="پایبندی به برنامه" help={HELP.adherence} value={formatPercent(overallPlan.pct, 0)} detail={`${formatMoney(overallPlan.executed, settings.displayUnit, true)} از ${formatMoney(overallPlan.planned, settings.displayUnit, true)}`} />
      <InsightCard icon={<RiSafe2Line />} label="پوشش صندوق‌ها" help={HELP.funds} value={formatPercent(target ? funded / target * 100 : 0, 0)} detail={`${formatMoney(funded, settings.displayUnit, true)} ذخیره شده`} />
      <InsightCard icon={<RiArrowUpLine />} label="بیشترین بازده سبد" help={HELP.return} value={best ? `${best.name} ${signedPercent(best.pnlPct)}` : "—"} detail={best ? `سود/زیان باز شما: ${formatMoney(best.pnl, settings.displayUnit, true)}` : "هنوز خرید واقعی کافی نیست"} positive />
      <InsightCard icon={<RiArrowDownLine />} iconTone={worst?.pnlPct !== undefined && worst.pnlPct < 0 ? "danger" : "neutral"} label="کمترین بازده سبد" help={HELP.return} value={worst ? `${worst.name} ${signedPercent(worst.pnlPct)}` : "—"} detail={worst ? `سود/زیان باز شما: ${formatMoney(worst.pnl, settings.displayUnit, true)}` : "هنوز خرید واقعی کافی نیست"} positive={worst?.pnlPct !== undefined ? worst.pnlPct >= 0 : undefined} />
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle><HelpLabel label="تقسیم کل پول ثبت‌شده" help={HELP.allocation} /></CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-[220px_1fr] sm:items-center"><div className="grid place-items-center"><AllocationDonut segments={allocationSegments(totalIncome, totals, rule)} /></div><div className="grid gap-2"><Legend color="var(--chart-3)" label="زندگی" value={allocationValue(totalIncome, totals.life, rule?.lifePct ?? 30)} /><Legend color="var(--chart-2)" label="امنیت" value={allocationValue(totalIncome, totals.safety, rule?.safetyPct ?? 20)} /><Legend color="var(--chart-1)" label="رشد" value={allocationValue(totalIncome, totals.growth, rule?.growthPct ?? 50)} /></div></CardContent></Card>
      <Card><CardHeader><CardTitle><HelpLabel label="تقسیم ماهانه" help={HELP.monthly} /></CardTitle></CardHeader><CardContent><MonthlyBars data={monthly} unit={settings.displayUnit} /></CardContent></Card>
    </div>

    <Card><CardHeader><CardTitle><HelpLabel label="پایبندی به برنامه‌های پول ورودی" help={HELP.adherence} /></CardTitle><p className="mt-1 type-caption text-muted-foreground">پیشنهاد پولم‌کو با آنچه واقعاً اجرا کرده‌ای مقایسه می‌شود.</p></CardHeader><CardContent><DataTable<PlanAdherenceRow> data={planRows} columns={planColumns} searchPlaceholder="جست‌وجوی برنامه..." mobileCard={(row) => <div className="p-4"><div className="flex items-start justify-between"><strong>{row.title}</strong><SensitiveValue className="type-strong text-primary">{formatPercent(row.pct, 0)}</SensitiveValue></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Small label="برنامه" value={formatMoney(row.planned, settings.displayUnit, true)} /><Small label="اجراشده" value={formatMoney(row.executed, settings.displayUnit, true)} /></div></div>} /></CardContent></Card>

    <Card><CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle><HelpLabel label="تخصیص هدف در برابر واقعیت" help={HELP.drift} /></CardTitle><p className="mt-1 type-caption text-muted-foreground">برای نزدیک‌شدن به هدف، پول جدید می‌تواند اول به دارایی‌های کم‌وزن‌تر برسد.</p></div><Badge>Rebalance با پول جدید</Badge></CardHeader><CardContent><DataTable<PerformanceRow> data={perf} columns={columns} searchPlaceholder="جست‌وجوی دارایی..." mobileCard={(row) => <PerformanceMobile row={row} settings={settings} />} /></CardContent></Card>
  </div>;
}

function InsightCard({ icon, iconTone = "primary", label, help, value, detail, positive }: { icon: React.ReactNode; iconTone?: "primary" | "danger" | "neutral"; label: string; help?: string; value: string; detail: string; positive?: boolean }) {
  return <Card><CardContent className="p-4"><div className="flex justify-between gap-3"><div className="min-w-0"><div className="type-caption text-muted-foreground">{help ? <HelpLabel label={label} help={help} /> : label}</div><SensitiveValue className={cn("mt-2 text-lg type-strong", positive !== undefined && (positive ? "text-primary" : "text-destructive"))}>{value}</SensitiveValue><div className="mt-1 text-[10px] text-muted-foreground"><SensitiveValue>{detail}</SensitiveValue></div></div><KpiIcon tone={iconTone}>{icon}</KpiIcon></div></CardContent></Card>;
}
function ReturnValue({ row, settings }: { row: PerformanceRow; settings: AppSettings }) { return <div className={cn("type-strong", row.pnlPct >= 0 ? "text-primary" : "text-destructive")}><SensitiveValue>{signedPercent(row.pnlPct)}</SensitiveValue><div className="type-caption text-[10px]"><SensitiveValue>{formatMoney(row.pnl, settings.displayUnit, true)}</SensitiveValue></div></div>; }
function DriftValue({ value }: { value: number }) { const label = value > 0.05 ? "بالاتر از هدف" : value < -0.05 ? "کمتر از هدف" : "روی هدف"; return <div><SensitiveValue className="type-strong">{signedPercent(value)}</SensitiveValue><div className="text-[10px] text-muted-foreground">{label}</div></div>; }
function Legend({ label, value, color }: { label: string; value: number; color: string }) { return <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: color }} /><span className="type-label">{label}</span></div><SensitiveValue className="type-strong">{formatPercent(value, 0)}</SensitiveValue></div>; }
function Small({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-muted/50 p-2"><SensitiveValue className="type-strong">{value}</SensitiveValue><div className="mt-1 text-[10px] text-muted-foreground">{label}</div></div>; }
function PerformanceMobile({ row, settings }: { row: PerformanceRow; settings: AppSettings }) { const drift = row.actual - row.target; return <div className="p-4"><div className="flex items-start justify-between"><div><div className="type-strong">{row.name}</div><div className="mt-1 type-caption text-muted-foreground">ارزش <SensitiveValue>{formatMoney(row.value, settings.displayUnit)}</SensitiveValue></div></div><SensitiveValue className={cn("type-strong", row.pnlPct >= 0 ? "text-primary" : "text-destructive")}>{signedPercent(row.pnlPct)}</SensitiveValue></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><Small label="هدف" value={formatPercent(row.target, 0)} /><Small label="سهم فعلی" value={formatPercent(row.actual, 1)} /><Small label="فاصله" value={signedPercent(drift)} /></div><div className="mt-2 type-caption text-muted-foreground">بازده از قیمت خرید واقعی شماست، نه تغییر روزانه بازار.</div></div>; }
function allocationValue(totalIncome: number, value: number, fallback: number) { return totalIncome ? value / totalIncome * 100 : fallback; }
function allocationSegments(totalIncome: number, totals: { life: number; safety: number; growth: number }, rule?: AllocationRule) { return [{ label: "زندگی", value: allocationValue(totalIncome, totals.life, rule?.lifePct ?? 30) }, { label: "امنیت", value: allocationValue(totalIncome, totals.safety, rule?.safetyPct ?? 20) }, { label: "رشد", value: allocationValue(totalIncome, totals.growth, rule?.growthPct ?? 50) }]; }
function signedPercent(value: number) { return `${value > 0 ? "+" : ""}${formatPercent(value)}`; }
