"use client";

import { useState } from "react";
import { RiArrowDownSLine, RiShoppingBag3Line, RiStackLine } from "react-icons/ri";
import { formatMoney, formatPercent, toPersianDate } from "@/lib/format";
import { planProgress, planRemaining } from "@/lib/plan-execution";
import type { AppSettings, Asset, IncomeEvent, PlanItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SensitiveValue } from "@/components/ui/sensitive-value";

const MAX_VISIBLE_GROUPS = 4;

const T = {
  title: "خریدهای برنامه‌ریزی‌شده",
  desc: "به‌جای یک دیوار از کارت‌های تکراری، خریدهای باقی‌مانده بر اساس هر پول ورودی جمع شده‌اند.",
  buy: "ثبت خرید",
  remaining: "باقی‌مانده",
  pendingBuys: "خرید باقی",
  incomePlans: "پول ورودی",
  showOlder: "نمایش برنامه‌های قدیمی‌تر",
  showLess: "نمایش کمتر",
};

type PendingRow = { item: PlanItem; asset: Asset; income: IncomeEvent | undefined };
type PendingGroup = {
  key: number;
  income?: IncomeEvent;
  rows: PendingRow[];
  planned: number;
  executed: number;
  remaining: number;
};

function groupByIncome(rows: PendingRow[]) {
  const grouped = new Map<number, PendingGroup>();
  for (const row of rows) {
    const key = row.item.incomeId;
    const current = grouped.get(key) ?? { key, income: row.income, rows: [], planned: 0, executed: 0, remaining: 0 };
    current.rows.push(row);
    current.planned += row.item.plannedToman;
    current.executed += row.item.executedToman;
    current.remaining += planRemaining(row.item);
    grouped.set(key, current);
  }
  return [...grouped.values()].sort((a, b) => {
    const aDate = a.income?.happenedAt ?? a.rows[0]?.item.createdAt ?? "";
    const bDate = b.income?.happenedAt ?? b.rows[0]?.item.createdAt ?? "";
    return bDate.localeCompare(aDate);
  });
}

export function PendingPlanPurchases({ planItems, incomes, assets, settings, onBuy }: {
  planItems: PlanItem[];
  incomes: IncomeEvent[];
  assets: Asset[];
  settings: AppSettings;
  onBuy: (item: PlanItem, asset: Asset) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const rows = planItems
    .filter((item) => item.bucket === "growth" && item.targetType === "asset" && item.targetId && planRemaining(item) > 0)
    .map((item): PendingRow | null => {
      const asset = assets.find((candidate) => candidate.id === item.targetId);
      if (!asset) return null;
      return { item, asset, income: incomes.find((income) => income.id === item.incomeId) };
    })
    .filter((row): row is PendingRow => row !== null);
  if (!rows.length) return null;

  const groups = groupByIncome(rows);
  const visibleGroups = showAll ? groups : groups.slice(0, MAX_VISIBLE_GROUPS);
  const totalRemaining = groups.reduce((sum, group) => sum + group.remaining, 0);

  return (
    <Card data-pending-plan-purchases="true" className="overflow-hidden border-primary/20 bg-primary/[.025]">
      <CardHeader className="grid gap-4 border-b bg-background/45 sm:flex sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2"><RiShoppingBag3Line className="text-primary" />{T.title}</CardTitle>
          <p className="mt-1 max-w-2xl type-caption text-muted-foreground">{T.desc}</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:min-w-64">
          <SummaryMetric label={T.remaining} value={formatMoney(totalRemaining, settings.displayUnit, true)} sensitive />
          <SummaryMetric label={T.incomePlans} value={new Intl.NumberFormat("fa-IR").format(groups.length)} />
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          {visibleGroups.map((group, index) => (
            <PendingIncomeGroup key={group.key} group={group} settings={settings} defaultOpen={index === 0} onBuy={onBuy} />
          ))}
        </div>
        {groups.length > MAX_VISIBLE_GROUPS && (
          <Button type="button" variant="ghost" className="mt-3 w-full text-muted-foreground" onClick={() => setShowAll((value) => !value)}>
            <RiStackLine />
            {showAll ? T.showLess : `${T.showOlder} (${new Intl.NumberFormat("fa-IR").format(groups.length - MAX_VISIBLE_GROUPS)})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PendingIncomeGroup({ group, settings, defaultOpen, onBuy }: {
  group: PendingGroup;
  settings: AppSettings;
  defaultOpen: boolean;
  onBuy: (item: PlanItem, asset: Asset) => void;
}) {
  const progress = group.planned > 0 ? Math.min(100, group.executed / group.planned * 100) : 0;
  return (
    <details data-pending-income-group="true" open={defaultOpen} className="group overflow-hidden rounded-2xl border bg-background/70 open:border-primary/20 open:bg-background">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3.5 marker:content-none sm:p-4 [&::-webkit-details-marker]:hidden">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><RiStackLine className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="type-strong">{group.income?.title ?? "برنامه پول ورودی"}</span>
            <Badge className="text-muted-foreground">{new Intl.NumberFormat("fa-IR").format(group.rows.length)} {T.pendingBuys}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 type-caption text-muted-foreground">
            <span>{group.income?.happenedAt ? toPersianDate(group.income.happenedAt) : "تاریخ ثبت نشده"}</span>
            <span>{formatPercent(progress, 0)} اجرا شده</span>
          </div>
        </div>
        <div className="shrink-0 text-end">
          <div className="text-[10px] text-muted-foreground">{T.remaining}</div>
          <SensitiveValue className="mt-0.5 block type-strong text-primary">{formatMoney(group.remaining, settings.displayUnit, true)}</SensitiveValue>
        </div>
        <RiArrowDownSLine className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t p-3 sm:p-4">
        <Progress value={progress} className="mb-3 h-1.5" />
        <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
          {group.rows.map(({ item, asset }) => (
            <PendingPurchaseRow key={item.id} item={item} asset={asset} settings={settings} onBuy={() => onBuy(item, asset)} />
          ))}
        </div>
      </div>
    </details>
  );
}

function PendingPurchaseRow({ item, asset, settings, onBuy }: {
  item: PlanItem;
  asset: Asset;
  settings: AppSettings;
  onBuy: () => void;
}) {
  const progress = planProgress(item);
  return (
    <div data-pending-purchase-row="true" className="flex items-center gap-3 rounded-xl border bg-muted/15 p-3 transition-colors hover:border-primary/20 hover:bg-primary/[.025]">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate type-strong">{asset.name}</span>
          <SensitiveValue className="shrink-0 type-data text-xs">{formatMoney(planRemaining(item), settings.displayUnit, true)}</SensitiveValue>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="shrink-0 text-[10px] text-muted-foreground">{formatPercent(progress, 0)}</span>
        </div>
      </div>
      <Button type="button" size="sm" onClick={onBuy}><RiShoppingBag3Line />{T.buy}</Button>
    </div>
  );
}

function SummaryMetric({ label, value, sensitive = false }: { label: string; value: string; sensitive?: boolean }) {
  return (
    <div className="rounded-xl border bg-background/65 px-3 py-2 text-end">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {sensitive ? <SensitiveValue className="mt-1 type-strong">{value}</SensitiveValue> : <div className="mt-1 type-strong">{value}</div>}
    </div>
  );
}
