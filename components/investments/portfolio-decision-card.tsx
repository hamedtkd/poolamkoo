"use client";

import { RiAlertLine, RiCompass3Line, RiInformationLine, RiScalesLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { formatMoney, formatPercent } from "@/lib/format";
import type { PortfolioAllocationReview, PortfolioAllocationRow } from "@/lib/portfolio-allocation";
import type { AppSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabel = {
  underweight: "کمتر از هدف",
  "near-target": "نزدیک هدف",
  overweight: "بیشتر از هدف",
  "no-target": "بدون هدف",
} as const;

export function PortfolioDecisionCard({ review, settings }: { review: PortfolioAllocationReview; settings: AppSettings }) {
  if (!review.rows.length || review.totalValue <= 0) {
    return <Card><CardContent className="grid min-h-40 place-items-center p-6 text-center"><div><RiScalesLine className="mx-auto size-8 text-muted-foreground" /><div className="mt-3 type-strong">ترکیب سبد بعد از ثبت دارایی شکل می‌گیرد</div><p className="mt-1 type-caption text-muted-foreground">وقتی خرید یا دارایی قبلی ثبت شود، سهم فعلی با هدف‌های خودت مقایسه می‌شود.</p></div></CardContent></Card>;
  }

  const visibleRows = [...review.rows].sort((a, b) => b.currentValue - a.currentValue || a.asset.name.localeCompare(b.asset.name, "fa"));
  const aligned = review.targetsValid && !review.pricingIncomplete && review.underweightRows.length === 0 && review.overweightRows.length === 0;

  return <Card>
    <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div><CardTitle className="flex items-center gap-2"><RiCompass3Line className="text-primary" /> مرور ترکیب سبد</CardTitle><p className="mt-1 type-caption text-muted-foreground">مقایسه سهم فعلی با هدف‌هایی که خودت تعیین کرده‌ای؛ این بخش توصیه خرید یا فروش نیست.</p></div>
      <Badge className={cn(aligned ? "text-primary" : "text-foreground")}>{review.pricingIncomplete ? "قیمت ناقص" : aligned ? "نزدیک هدف" : "نیازمند مرور"}</Badge>
    </CardHeader>
    <CardContent className="space-y-5">
      {review.pricingIncomplete && <Notice icon={<RiAlertLine />} title="اولویت پول جدید موقتاً متوقف است">برای حداقل یک داراییِ موجود، قیمت تازه بازار یا قیمت دستی قابل اتکا نداریم و ارزش از Snapshot محلی یا بهای خرید fallback می‌آید. درصدهای ترکیب برای مرور باقی می‌مانند، اما اولویت خودکار پول جدید تا کامل‌شدن قیمت‌ها نمایش داده نمی‌شود.</Notice>}
      {!review.targetsValid && <Notice icon={<RiInformationLine />} title={`جمع سهم هدف ${formatPercent(review.totalTargetPct, 0)} است`}>برای اینکه اولویتِ بررسی پول جدید معنی‌دار باشد، جمع سهم هدف دارایی‌ها باید ۱۰۰٪ باشد. تا آن زمان فقط وضعیت فعلی و فاصله‌ها را نشان می‌دهیم.</Notice>}

      <div className="space-y-3">
        {visibleRows.map((row) => <AllocationRow key={row.asset.id ?? row.asset.name} row={row} />)}
      </div>

      {review.targetsValid && review.newMoneyPriorities.length > 0 && <div className="rounded-2xl border bg-muted/20 p-4">
        <div className="type-strong">اولویت بررسی برای پول جدید</div>
        <p className="mt-1 type-caption text-muted-foreground">این ترتیب فقط کمبود نسبت به هدف فعلی تو را نشان می‌دهد؛ وضعیت بازار یا بازده آینده را پیش‌بینی نمی‌کند.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {review.newMoneyPriorities.slice(0, 3).map((row) => <div key={row.asset.id ?? row.asset.name} className="rounded-xl border bg-background/70 p-3"><div className="flex items-center justify-between gap-2"><span className="type-strong">{row.asset.name}</span><Badge className="text-primary">کمتر از هدف</Badge></div><div className="mt-2 type-caption text-muted-foreground">فاصله ارزشی تا هدف</div><SensitiveValue className="mt-1 type-strong">{formatMoney(Math.max(0, row.gapValue), settings.displayUnit)}</SensitiveValue></div>)}
        </div>
      </div>}
    </CardContent>
  </Card>;
}

function AllocationRow({ row }: { row: PortfolioAllocationRow }) {
  const current = Math.max(0, Math.min(100, row.currentPct));
  const target = Math.max(0, Math.min(100, row.targetPct));
  return <div className="rounded-xl border p-3">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><div className="type-strong">{row.asset.name}</div><div className="mt-1 type-caption text-muted-foreground">سهم فعلی {formatPercent(row.currentPct, 1)} · سهم هدف {formatPercent(row.targetPct, 1)}</div></div><Badge className={cn(row.status === "underweight" && "text-primary", row.status === "overweight" && "text-destructive")}>{statusLabel[row.status]}</Badge></div>
    <div className="relative mt-3 h-2 overflow-visible rounded-full bg-muted" aria-label={`سهم فعلی ${formatPercent(row.currentPct, 1)}، سهم هدف ${formatPercent(row.targetPct, 1)}`}>
      <div className="h-full rounded-full bg-primary/70" style={{ width: `${current}%` }} />
      {row.targetPct > 0 && <span className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-foreground" style={{ insetInlineStart: `${target}%` }} aria-hidden="true" />}
    </div>
    <div className="mt-2 type-caption text-muted-foreground">فاصله با هدف: {row.driftPct > 0 ? "+" : ""}{formatPercent(row.driftPct, 1)}</div>
  </div>;
}

function Notice({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="flex gap-3 rounded-xl border bg-muted/25 p-3"><div className="mt-0.5 text-primary">{icon}</div><div><div className="type-strong">{title}</div><p className="mt-1 type-caption text-muted-foreground">{children}</p></div></div>;
}
