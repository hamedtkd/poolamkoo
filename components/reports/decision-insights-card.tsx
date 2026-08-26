"use client";

import { RiFileList3Line, RiInformationLine, RiMoneyDollarCircleLine, RiSafe2Line } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { formatMoney, formatPercent } from "@/lib/format";
import { reportBucketLabel, type ReportDecisionSnapshot, type ReportHealth } from "@/lib/report-insights";
import type { MoneyUnit } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DecisionInsightsCard({ snapshot, unit }: { snapshot: ReportDecisionSnapshot; unit: MoneyUnit }) {
  const reviewItems = buildReviewItems(snapshot, unit);
  return (
    <Card>
      <CardHeader>
        <CardTitle>جمع‌بندی تصمیمی این بازه</CardTitle>
        <p className="mt-1 type-caption text-muted-foreground">فقط از ورودی، تخصیص و اجرای ثبت‌شده استفاده می‌شود؛ هزینه روزمره و پیش‌بینی بازار وارد این تحلیل نمی‌شوند.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <DecisionMetric icon={<RiFileList3Line />} title="اجرای برنامه" health={snapshot.plan.health} value={snapshot.plan.planned > 0 ? formatPercent(snapshot.plan.pct, 0) : "—"} detail={snapshot.plan.planned > 0 ? `${formatMoney(snapshot.plan.remaining, unit, true)} از برنامه هنوز اجرا نشده` : "در این بازه برنامه اجرایی ثبت نشده است."} />
          <DecisionMetric icon={<RiMoneyDollarCircleLine />} title="تعادل قانون پول" health={allocationHealth(snapshot)} value={allocationValue(snapshot)} detail={allocationDetail(snapshot)} />
          <DecisionMetric icon={<RiSafe2Line />} title="وضعیت فعلی صندوق‌ها" health={snapshot.funds.health} value={snapshot.funds.target > 0 ? formatPercent(snapshot.funds.pct, 0) : "—"} detail={snapshot.funds.target > 0 ? `${formatMoney(snapshot.funds.remaining, unit, true)} تا مجموع هدف صندوق‌ها مانده` : "برای صندوق‌ها هدف قابل محاسبه‌ای ثبت نشده است."} />
        </div>
        <AllocationComparison snapshot={snapshot} />
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="flex items-center gap-2 type-strong"><RiInformationLine className="text-primary" /> برای مرور بعدی</div>
          <ul className="mt-3 space-y-2 text-xs leading-6 text-muted-foreground">
            {reviewItems.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span>{item}</span></li>)}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function DecisionMetric({ icon, title, value, detail, health }: { icon: React.ReactNode; title: string; value: string; detail: string; health: ReportHealth }) {
  return <div className="rounded-2xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-caption text-muted-foreground">{title}</div><SensitiveValue className={cn("mt-2 text-xl type-strong", health === "strong" && "text-primary", health === "attention" && "text-destructive")}>{value}</SensitiveValue></div><KpiIcon tone={health === "attention" ? "danger" : health === "strong" ? "primary" : "neutral"}>{icon}</KpiIcon></div><SensitiveValue className="mt-3 block text-[11px] leading-6 text-muted-foreground">{detail}</SensitiveValue></div>;
}

function AllocationComparison({ snapshot }: { snapshot: ReportDecisionSnapshot }) {
  if (!snapshot.allocatedTotal) return <div className="rounded-2xl border border-dashed p-4 text-center text-xs text-muted-foreground">برای مقایسه قانون پول با واقعیت، اول یک پول ورودی را تخصیص بده.</div>;
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="type-strong">قانون پول در برابر تخصیص ثبت‌شده</div><p className="mt-1 type-caption text-muted-foreground">نوار بالا سهم ثبت‌شده و نوار باریک پایین هدف قانون فعلی است.</p></div>{!snapshot.allocationReliable && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] text-destructive">تخصیص ناقص</span>}</div>
      <div className="mt-4 grid gap-3">{snapshot.buckets.map((row) => <div key={row.bucket} className="grid gap-2 sm:grid-cols-[72px_1fr_auto] sm:items-center"><span className="text-xs type-strong">{reportBucketLabel(row.bucket)}</span><div className="grid gap-1"><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${boundedPct(row.actualPct)}%` }} /></div><div className="h-1 overflow-hidden rounded-full bg-muted/60"><div className="h-full rounded-full bg-foreground/35" style={{ width: `${boundedPct(row.targetPct)}%` }} /></div></div><SensitiveValue className={cn("text-xs type-strong", row.driftPct < -1 && "text-destructive", Math.abs(row.driftPct) <= 1 && "text-primary")}>{formatPercent(row.actualPct, 1)} / {formatPercent(row.targetPct, 0)}</SensitiveValue></div>)}</div>
    </div>
  );
}

function allocationHealth(snapshot: ReportDecisionSnapshot): ReportHealth {
  if (!snapshot.totalIncome || !snapshot.allocatedTotal) return "empty";
  if (!snapshot.allocationReliable || !snapshot.allocationTargetsValid) return "attention";
  return snapshot.largestUnderTarget ? "steady" : "strong";
}
function allocationValue(snapshot: ReportDecisionSnapshot) {
  if (!snapshot.totalIncome) return "—";
  if (!snapshot.allocationReliable) return `${formatPercent(snapshot.allocationCoveragePct, 0)} تخصیص‌یافته`;
  if (!snapshot.allocationTargetsValid) return "هدف نامعتبر";
  return snapshot.largestUnderTarget ? `${reportBucketLabel(snapshot.largestUnderTarget.bucket)} کمتر از هدف` : "نزدیک قانون";
}
function allocationDetail(snapshot: ReportDecisionSnapshot) {
  if (!snapshot.totalIncome) return "در این بازه پول ورودی ثبت نشده است.";
  if (!snapshot.allocationReliable) return `${formatPercent(snapshot.allocationCoveragePct, 0)} از پول ورودی این بازه تخصیص معتبر دارد.`;
  if (!snapshot.allocationTargetsValid) return "جمع درصدهای قانون پول باید حدود ۱۰۰٪ باشد تا مقایسه معتبر شود.";
  const gap = snapshot.largestUnderTarget;
  if (!gap) return "هر سه بخش در محدوده یک واحد درصد از قانون فعلی هستند.";
  return `${reportBucketLabel(gap.bucket)} با ${formatPercent(gap.actualPct, 1)}، ${formatPercent(Math.abs(gap.driftPct), 1)} واحد درصد کمتر از هدف ${formatPercent(gap.targetPct, 0)} است.`;
}
function buildReviewItems(snapshot: ReportDecisionSnapshot, unit: MoneyUnit) {
  const items: string[] = [];
  if (snapshot.plan.remaining > 0) items.push(`${formatMoney(snapshot.plan.remaining, unit, true)} از برنامه‌های این بازه هنوز اجرای ثبت‌شده ندارند.`);
  if (snapshot.totalIncome > 0 && !snapshot.allocationReliable) items.push("تخصیص پول‌های ورودی این بازه کامل نیست؛ قبل از نتیجه‌گیری درباره قانون پول، آن را کامل کن.");
  else if (snapshot.largestUnderTarget) items.push(`در تصمیم پول ورودی بعدی، فاصله بخش «${reportBucketLabel(snapshot.largestUnderTarget.bucket)}» با قانون فعلی را دوباره بررسی کن.`);
  if (snapshot.funds.remaining > 0) items.push(`صندوق‌ها در وضعیت فعلی ${formatMoney(snapshot.funds.remaining, unit, true)} تا مجموع هدف ثبت‌شده فاصله دارند.`);
  if (!items.length) items.push("داده ثبت‌شده این بازه نشانه فوری برای پیگیری ندارد؛ روند را در بازه بعدی دوباره مقایسه کن.");
  return items.slice(0, 3);
}
function boundedPct(value: number) { return Math.min(100, Math.max(0, value)); }
