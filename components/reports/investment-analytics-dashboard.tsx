"use client";

import { RiBarChartBoxLine, RiFundsLine, RiLineChartLine, RiPieChart2Line, RiPriceTag3Line } from "react-icons/ri";
import { InvestmentLotsCard } from "@/components/investments/investment-lots-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvestmentAnalytics } from "@/hooks/use-investment-analytics";
import type { InvestmentAssetAnalytics } from "@/lib/investment-analytics";
import { formatMoney, formatPercent, formatSignedMoney, formatSignedPercent } from "@/lib/format";
import { valuationPriceSourceLabel } from "@/lib/market/valuation";
import type { AppSettings, Asset, InvestmentTransaction, MarketQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InvestmentAnalyticsDashboard({ settings, assets, transactions, quotes }: {
  settings: AppSettings;
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
}) {
  const report = useInvestmentAnalytics(assets, transactions, quotes);
  const hasInvestments = report.assets.some((row) => row.totalBuyToman > 0);
  if (!hasInvestments) return <EmptyState />;

  return <section className="space-y-4">
    <div><div className="type-caption type-body-strong text-primary">تحلیل عمیق سرمایه</div><h2 className="mt-1 type-section-title">سرمایه من از چه چیزهایی ساخته شده؟</h2><p className="mt-1 type-caption leading-6 text-muted-foreground">بهای خرید، ارزش فعلی، سود قطعی و سود باز جدا از هم نمایش داده می‌شوند. خریدهای هر دارایی نیز به‌صورت مستقل قابل بررسی‌اند.</p></div>
    <Tabs defaultValue="overview" dir="rtl">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:inline-flex sm:w-auto sm:grid-cols-none">
        <TabsTrigger value="overview">نمای کلی</TabsTrigger>
        <TabsTrigger value="composition">ترکیب سرمایه</TabsTrigger>
        <TabsTrigger value="performance">عملکرد</TabsTrigger>
        <TabsTrigger value="lots">خریدها</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4 space-y-4"><Overview report={report} settings={settings} /></TabsContent>
      <TabsContent value="composition" className="mt-4"><Composition report={report} settings={settings} /></TabsContent>
      <TabsContent value="performance" className="mt-4"><Performance report={report} settings={settings} /></TabsContent>
      <TabsContent value="lots" className="mt-4"><InvestmentLotsCard assets={assets} transactions={transactions} quotes={quotes} settings={settings} title="سود و زیان به تفکیک هر خرید" /></TabsContent>
    </Tabs>
  </section>;
}

function Overview({ report, settings }: { report: ReturnType<typeof useInvestmentAnalytics>; settings: AppSettings }) {
  return <>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<RiFundsLine />} label="بهای خرید باز" value={formatMoney(report.openCostToman, settings.displayUnit)} detail="پولی که هنوز داخل دارایی‌های باز مانده است" />
      <Metric icon={<RiPriceTag3Line />} label="ارزش فعلی دارای قیمت" value={formatMoney(report.pricedCurrentValueToman, settings.displayUnit)} detail={`پوشش قیمت: ${formatPercent(report.priceCoveragePct, 0)}`} />
      <Metric icon={<RiLineChartLine />} label="سود / زیان باز" value={formatSignedMoney(report.unrealizedPnlToman, settings.displayUnit)} detail="فقط بخش‌هایی که قیمت فعلی دارند" tone={report.unrealizedPnlToman} />
      <Metric icon={<RiBarChartBoxLine />} label="سود / زیان قطعی" value={formatSignedMoney(report.realizedPnlToman, settings.displayUnit)} detail="از فروش‌های ثبت‌شده" tone={report.realizedPnlToman} />
    </div>
    {!report.pricingComplete && <div className="rounded-2xl border border-amber-500/25 bg-amber-500/7 p-4 type-caption leading-6 text-muted-foreground"><strong className="text-foreground">همه دارایی‌ها قیمت فعلی ندارند.</strong> موجودی، بهای خرید و سود قطعی کامل است؛ ولی ارزش فعلی و سود باز فقط برای بخش دارای قیمت محاسبه شده تا عدد ساختگی نمایش داده نشود.</div>}
    <Card><CardHeader><CardTitle>خلاصه جریان سرمایه‌گذاری</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Summary label="کل خرید تاریخی" value={formatMoney(report.totalBuyToman, settings.displayUnit)} /><Summary label="کل فروش تاریخی" value={formatMoney(report.totalSellToman, settings.displayUnit)} /><Summary label="سود/زیان باز" value={formatSignedMoney(report.unrealizedPnlToman, settings.displayUnit)} tone={report.unrealizedPnlToman} /><Summary label="سود/زیان قطعی" value={formatSignedMoney(report.realizedPnlToman, settings.displayUnit)} tone={report.realizedPnlToman} /></CardContent></Card>
  </>;
}

function Composition({ report, settings }: { report: ReturnType<typeof useInvestmentAnalytics>; settings: AppSettings }) {
  const byCost = report.assets.filter((row) => row.openCostToman > 0).sort((a, b) => b.costSharePct - a.costSharePct);
  const byValue = report.assets.filter((row) => row.currentValueToman !== undefined && row.currentValueToman > 0).sort((a, b) => (b.valueSharePct ?? 0) - (a.valueSharePct ?? 0));
  return <div className="grid gap-4 lg:grid-cols-2">
    <Card><CardHeader><CardTitle>پولم را کجا سرمایه‌گذاری کرده‌ام؟</CardTitle><p className="mt-1 type-caption text-muted-foreground">بر اساس بهای خرید مقدارهایی که هنوز در سبد باقی مانده‌اند.</p></CardHeader><CardContent><ShareBars rows={byCost} mode="cost" settings={settings} /></CardContent></Card>
    <Card><CardHeader><CardTitle>سرمایه فعلی من از چه چیزهایی تشکیل شده؟</CardTitle><p className="mt-1 type-caption text-muted-foreground">بر اساس آخرین قیمت در دسترس؛ دارایی بدون قیمت وارد درصدها نمی‌شود.</p></CardHeader><CardContent><ShareBars rows={byValue} mode="value" settings={settings} /></CardContent></Card>
  </div>;
}

function Performance({ report, settings }: { report: ReturnType<typeof useInvestmentAnalytics>; settings: AppSettings }) {
  const rows = [...report.assets].filter((row) => row.openCostToman > 0 || Math.abs(row.realizedPnlToman) > 0).sort((a, b) => (b.totalPnlToman ?? b.realizedPnlToman) - (a.totalPnlToman ?? a.realizedPnlToman));
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2"><Highlight label="بیشترین بازده باز" row={report.best} settings={settings} /><Highlight label="کمترین بازده باز" row={report.worst} settings={settings} /></div>
    <Card><CardHeader><CardTitle>سود و زیان هر دارایی</CardTitle><p className="mt-1 type-caption text-muted-foreground">سود قطعی حاصل فروش و سود باز دارایی‌های نگهداری‌شده از هم جدا هستند.</p></CardHeader><CardContent className="space-y-4">{rows.map((row) => <PnlRow key={row.asset.id ?? row.asset.name} row={row} settings={settings} />)}</CardContent></Card>
  </div>;
}

function ShareBars({ rows, mode, settings }: { rows: InvestmentAssetAnalytics[]; mode: "cost" | "value"; settings: AppSettings }) {
  if (!rows.length) return <div className="rounded-xl border border-dashed p-6 text-center type-caption text-muted-foreground">داده کافی برای این نمودار وجود ندارد.</div>;
  return <div className="space-y-4">{rows.map((row) => { const pct = mode === "cost" ? row.costSharePct : row.valueSharePct ?? 0; const value = mode === "cost" ? row.openCostToman : row.currentValueToman ?? 0; return <div key={row.asset.id ?? row.asset.name}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="type-strong">{row.asset.name}</span><span className="text-muted-foreground"><SensitiveValue>{formatMoney(value, settings.displayUnit, true)}</SensitiveValue> · {formatPercent(pct, 1)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} /></div></div>; })}</div>;
}

function PnlRow({ row, settings }: { row: InvestmentAssetAnalytics; settings: AppSettings }) {
  const open = row.unrealizedPnlToman;
  const total = row.totalPnlToman ?? row.realizedPnlToman;
  const max = Math.max(1, Math.abs(total), Math.abs(row.realizedPnlToman), Math.abs(open ?? 0));
  return <div className="rounded-2xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="type-strong">{row.asset.name}</div><div className="mt-1 text-[10px] text-muted-foreground">{valuationPriceSourceLabel(row.priceSource)} · {new Intl.NumberFormat("fa-IR").format(row.openLotCount)} خرید باز از {new Intl.NumberFormat("fa-IR").format(row.lotCount)} خرید</div></div><SensitiveValue className={cn("type-strong", total > 0 && "text-profit", total < 0 && "text-loss")}>{formatSignedMoney(total, settings.displayUnit)}</SensitiveValue></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><PnlBar label="قطعی" value={row.realizedPnlToman} max={max} settings={settings} /><PnlBar label="باز" value={open} max={max} settings={settings} /></div></div>;
}

function PnlBar({ label, value, max, settings }: { label: string; value?: number; max: number; settings: AppSettings }) {
  if (value === undefined) return <div><div className="flex justify-between type-caption"><span>{label}</span><span className="text-muted-foreground">قیمت فعلی نداریم</span></div><div className="mt-2 h-2 rounded-full bg-muted" /></div>;
  return <div><div className="flex justify-between type-caption"><span>{label}</span><SensitiveValue className={cn(value > 0 && "text-profit", value < 0 && "text-loss")}>{formatSignedMoney(value, settings.displayUnit, true)}</SensitiveValue></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", value >= 0 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${Math.min(100, Math.abs(value) / max * 100)}%` }} /></div></div>;
}

function Highlight({ label, row, settings }: { label: string; row?: InvestmentAssetAnalytics; settings: AppSettings }) {
  return <Card><CardContent className="p-4"><div className="type-caption text-muted-foreground">{label}</div>{row ? <><div className="mt-2 type-strong">{row.asset.name}</div><SensitiveValue className={cn("mt-1 text-lg type-strong", (row.unrealizedReturnPct ?? 0) >= 0 ? "text-profit" : "text-loss")}>{formatSignedPercent(row.unrealizedReturnPct ?? 0)}</SensitiveValue><div className="mt-1 type-caption text-muted-foreground"><SensitiveValue>{formatSignedMoney(row.unrealizedPnlToman ?? 0, settings.displayUnit, true)}</SensitiveValue></div></> : <div className="mt-2 text-sm text-muted-foreground">قیمت کافی نداریم</div>}</CardContent></Card>;
}

function Metric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone?: number }) {
  return <Card><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-2 type-section-title", tone !== undefined && tone > 0 && "text-profit", tone !== undefined && tone < 0 && "text-loss")}>{value}</SensitiveValue><div className="mt-1 text-[10px] text-muted-foreground">{detail}</div></div><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</span></div></CardContent></Card>;
}
function Summary({ label, value, tone }: { label: string; value: string; tone?: number }) { return <div className="rounded-xl bg-muted/45 p-3"><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-1 type-strong", tone !== undefined && tone > 0 && "text-profit", tone !== undefined && tone < 0 && "text-loss")}>{value}</SensitiveValue></div>; }
function EmptyState() { return <Card><CardContent className="grid min-h-48 place-items-center p-6 text-center"><div><RiPieChart2Line className="mx-auto size-8 text-primary" /><div className="mt-3 type-strong">هنوز خرید سرمایه‌گذاری ثبت نشده</div><p className="mt-2 type-caption text-muted-foreground">بعد از ثبت اولین خرید، ترکیب سرمایه و سود هر خرید اینجا ساخته می‌شود.</p></div></CardContent></Card>; }
