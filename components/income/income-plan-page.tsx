"use client";

import { useState } from "react";
import Link from "next/link";
import { RiAddLine, RiArrowRightLine } from "react-icons/ri";
import { PlanDeleteDialog } from "@/components/income/plan-delete-dialog";
import { PlanExecutionDialog } from "@/components/income/plan-execution-dialog";
import { PlanGroupCard } from "@/components/income/plan-group-card";
import { PlanProgressCard } from "@/components/income/plan-progress-card";
import { QuickPlanDialog } from "@/components/income/quick-plan-dialog";
import { TransactionDialog } from "@/components/investments/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIncomePlan } from "@/hooks/use-income-plan";
import { usePlanItemActions } from "@/hooks/use-plan-item-actions";
import { formatMoney, toPersianDate } from "@/lib/format";
import { planRemaining } from "@/lib/plan-execution";
import type { AppSettings, Asset, BucketKey, GoalFund, IncomeEvent, InvestmentTransaction, MarketQuote, PlanItem } from "@/lib/types";

const labels: Record<BucketKey, string> = { life: "زندگی", safety: "امنیت", growth: "رشد" };

export function IncomePlanPage({
  incomeId,
  settings,
  incomes,
  planItems,
  assets,
  funds,
  transactions,
  quotes,
}: {
  incomeId: number;
  settings: AppSettings;
  incomes: IncomeEvent[];
  planItems: PlanItem[];
  assets: Asset[];
  funds: GoalFund[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
}) {
  const state = useIncomePlan({ incomeId, incomes, planItems, assets, funds, quotes });
  const actions = usePlanItemActions({ income: state.income, planItems, assets, funds });
  const [executionItem, setExecutionItem] = useState<PlanItem | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<PlanItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PlanItem | null>(null);
  const [quickBucket, setQuickBucket] = useState<BucketKey>("growth");
  const [quickOpen, setQuickOpen] = useState(false);
  const asset = purchaseItem?.targetId ? state.assetMap.get(purchaseItem.targetId) ?? null : null;

  if (!state.income) {
    return <Card><CardContent className="p-8 text-center"><p>این پول ورودی پیدا نشد.</p><Link href="/income" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background/70 px-4 text-sm font-semibold hover:bg-accent">بازگشت به پول‌های ورودی</Link></CardContent></Card>;
  }

  const openQuick = (bucket: BucketKey = "growth") => {
    setQuickBucket(bucket);
    setQuickOpen(true);
  };
  const onItemAction = (item: PlanItem) => item.targetType === "asset" ? setPurchaseItem(item) : setExecutionItem(item);
  const groups = (["life", "safety", "growth"] as BucketKey[]).map((bucket) => ({
    bucket,
    title: labels[bucket],
    items: state.items.filter((item) => item.bucket === bucket),
  }));

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/income" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><RiArrowRightLine /> بازگشت به پول‌های ورودی</Link>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{state.income.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{toPersianDate(state.income.happenedAt)} · {formatMoney(state.income.amountToman, settings.displayUnit)}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => openQuick()}><RiAddLine /> کارت سریع برنامه</Button>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] 2xl:grid-cols-[22rem_minmax(0,1fr)]">
        <PlanProgressCard planned={state.progress.planned} executed={state.progress.executed} pct={state.progress.pct} settings={settings} />
        <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
          {groups.map((group) => (
            <PlanGroupCard
              key={group.bucket}
              title={group.title}
              items={group.items}
              settings={settings}
              wide={group.bucket === "growth"}
              onAction={onItemAction}
              onDelete={setDeleteItem}
              onQuickAdd={() => openQuick(group.bucket)}
            />
          ))}
        </div>
      </div>

      <PlanExecutionDialog item={executionItem} settings={settings} onClose={() => setExecutionItem(null)} />
      <TransactionDialog
        asset={asset}
        onClose={() => setPurchaseItem(null)}
        suggestedPrice={asset?.symbol ? state.quoteMap.get(asset.symbol)?.priceToman : asset?.manualPriceToman}
        availableQty={asset ? transactions.filter((tx) => tx.assetId === asset.id).reduce((qty, tx) => qty + (tx.type === "buy" ? tx.quantity : -tx.quantity), 0) : 0}
        settings={settings}
        planItem={purchaseItem}
        initialAmount={purchaseItem ? planRemaining(purchaseItem) : undefined}
        incomeId={state.income.id}
      />
      <QuickPlanDialog open={quickOpen} onOpenChange={setQuickOpen} settings={settings} income={state.income} planItems={planItems} assets={assets} funds={funds} initialBucket={quickBucket} />
      <PlanDeleteDialog
        item={deleteItem}
        onOpenChange={(open) => { if (!open) setDeleteItem(null); }}
        onConfirm={async () => { if (deleteItem) await actions.deletePlanItem(deleteItem); setDeleteItem(null); }}
      />
    </div>
  );
}
