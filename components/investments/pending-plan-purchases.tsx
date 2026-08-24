"use client";

import { RiArrowLeftLine, RiShoppingBag3Line } from "react-icons/ri";
import { formatMoney, toPersianDate } from "@/lib/format";
import { planRemaining } from "@/lib/plan-execution";
import type { AppSettings, Asset, IncomeEvent, PlanItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const T = {
  title: "\u062e\u0631\u06cc\u062f\u0647\u0627\u06cc \u067e\u06cc\u0634\u0646\u0647\u0627\u062f\u06cc \u0627\u0646\u062c\u0627\u0645\u200c\u0646\u0634\u062f\u0647",
  desc: "\u0627\u06cc\u0646 \u0645\u0628\u0644\u063a\u200c\u0647\u0627 \u0645\u0633\u062a\u0642\u06cc\u0645\u0627\u064b \u0627\u0632 \u0628\u0631\u0646\u0627\u0645\u0647 \u067e\u0648\u0644\u200c\u0647\u0627\u06cc \u0648\u0631\u0648\u062f\u06cc \u0645\u06cc\u200c\u0622\u06cc\u0646\u062f.",
  buy: "\u062b\u0628\u062a \u062e\u0631\u06cc\u062f",
  remaining: "\u0628\u0627\u0642\u06cc\u200c\u0645\u0627\u0646\u062f\u0647 \u067e\u06cc\u0634\u0646\u0647\u0627\u062f",
};

export function PendingPlanPurchases({ planItems, incomes, assets, settings, onBuy }: {
  planItems: PlanItem[];
  incomes: IncomeEvent[];
  assets: Asset[];
  settings: AppSettings;
  onBuy: (item: PlanItem, asset: Asset) => void;
}) {
  const rows = planItems
    .filter((item) => item.bucket === "growth" && item.targetType === "asset" && item.targetId && planRemaining(item) > 0)
    .map((item) => ({ item, asset: assets.find((asset) => asset.id === item.targetId), income: incomes.find((income) => income.id === item.incomeId) }))
    .filter((row): row is { item: PlanItem; asset: Asset; income: IncomeEvent | undefined } => Boolean(row.asset));
  if (!rows.length) return null;

  return <Card className="border-primary/20 bg-primary/[.025]">
    <CardHeader><CardTitle className="flex items-center gap-2"><RiShoppingBag3Line className="text-primary" />{T.title}</CardTitle><p className="mt-1 type-caption text-muted-foreground">{T.desc}</p></CardHeader>
    <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(({ item, asset, income }) => <div key={item.id} className="rounded-2xl border bg-background/65 p-4">
        <div className="flex items-start justify-between gap-3"><div><div className="type-strong">{asset.name}</div><div className="mt-1 text-[10px] text-muted-foreground">{income?.title ?? "-"}{income?.happenedAt ? ` - ${toPersianDate(income.happenedAt)}` : ""}</div></div><RiArrowLeftLine className="mt-1 text-primary" /></div>
        <div className="mt-4 rounded-xl bg-muted/45 p-3"><div className="text-[10px] text-muted-foreground">{T.remaining}</div><div className="mt-1 text-lg type-strong">{formatMoney(planRemaining(item), settings.displayUnit)}</div></div>
        <Button className="mt-3 w-full" onClick={() => onBuy(item, asset)}>{T.buy}</Button>
      </div>)}
    </CardContent>
  </Card>;
}
