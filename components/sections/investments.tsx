"use client";

import { useState } from "react";
import { RiAddLine } from "react-icons/ri";
import { AssetDialog } from "@/components/investments/asset-dialog";
import { MarketChartCard } from "@/components/investments/market-chart-card";
import { PendingPlanPurchases } from "@/components/investments/pending-plan-purchases";
import { PortfolioTables } from "@/components/investments/portfolio-tables";
import { TransactionDialog } from "@/components/investments/transaction-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInvestmentPortfolio } from "@/hooks/use-investment-portfolio";
import { db } from "@/lib/db";
import { formatMoney, formatPercent } from "@/lib/format";
import { planRemaining, syncInvestmentPlanItem } from "@/lib/plan-execution";
import type { AppSettings, Asset, IncomeEvent, InvestmentTransaction, MarketQuote, MarketSnapshot, PlanItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const T = {
  eyebrow: "\u0633\u0628\u062f \u0631\u0634\u062f",
  title: "\u0633\u0631\u0645\u0627\u06cc\u0647\u200c\u06af\u0630\u0627\u0631\u06cc\u200c\u0647\u0627",
  desc: "\u062e\u0631\u06cc\u062f \u0648\u0627\u0642\u0639\u06cc \u0631\u0627 \u062b\u0628\u062a \u06a9\u0646 \u062a\u0627 \u0633\u0648\u062f \u0648 \u0632\u06cc\u0627\u0646 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0628\u0647\u0627\u06cc \u062a\u0645\u0627\u0645\u200c\u0634\u062f\u0647 \u0645\u062d\u0627\u0633\u0628\u0647 \u0634\u0648\u062f.",
  add: "\u062f\u0627\u0631\u0627\u06cc\u06cc \u062c\u062f\u06cc\u062f",
  value: "\u0627\u0631\u0632\u0634 \u0641\u0639\u0644\u06cc",
  cost: "\u0628\u0647\u0627\u06cc \u062e\u0631\u06cc\u062f \u0628\u0627\u0632",
  pnl: "\u0633\u0648\u062f / \u0632\u06cc\u0627\u0646 \u0628\u0627\u0632",
  targetWarning: "\u062c\u0645\u0639 \u0633\u0647\u0645 \u0647\u062f\u0641 \u062f\u0627\u0631\u0627\u06cc\u06cc\u200c\u0647\u0627",
  targetTail: "\u0627\u0633\u062a. \u0628\u0631\u0627\u06cc \u067e\u06cc\u0634\u0646\u0647\u0627\u062f Rebalance \u0628\u0647\u062a\u0631 \u0627\u0633\u062a \u062c\u0645\u0639 \u0628\u0647 \u06f1\u06f0\u06f0\u066a \u0628\u0631\u0633\u062f.",
  archiveTitle: "\u0622\u0631\u0634\u06cc\u0648 \u062f\u0627\u0631\u0627\u06cc\u06cc\u061f",
  archiveDesc: "\u062f\u0627\u0631\u0627\u06cc\u06cc \u0627\u0632 \u0633\u0628\u062f \u0641\u0639\u0627\u0644 \u067e\u0646\u0647\u0627\u0646 \u0645\u06cc\u200c\u0634\u0648\u062f \u0627\u0645\u0627 \u062a\u0631\u0627\u06a9\u0646\u0634\u200c\u0647\u0627\u06cc \u0642\u0628\u0644\u06cc \u062d\u0630\u0641 \u0646\u0645\u06cc\u200c\u0634\u0648\u0646\u062f.",
  archive: "\u0622\u0631\u0634\u06cc\u0648 \u062f\u0627\u0631\u0627\u06cc\u06cc",
  deleteTitle: "\u062d\u0630\u0641 \u062a\u0631\u0627\u06a9\u0646\u0634\u061f",
  deleteDesc: "\u0627\u06cc\u0646 \u06a9\u0627\u0631 \u0645\u06cc\u0627\u0646\u06af\u06cc\u0646 \u062e\u0631\u06cc\u062f\u060c \u0645\u0648\u062c\u0648\u062f\u06cc\u060c \u0633\u0648\u062f \u0648 \u0632\u06cc\u0627\u0646 \u0648 \u0648\u0636\u0639\u06cc\u062a \u0627\u062c\u0631\u0627\u06cc \u0628\u0631\u0646\u0627\u0645\u0647 \u0631\u0627 \u062a\u063a\u06cc\u06cc\u0631 \u0645\u06cc\u200c\u062f\u0647\u062f.",
  delete: "\u062d\u0630\u0641 \u062a\u0631\u0627\u06a9\u0646\u0634",
};

type TransactionTarget = { asset: Asset; planItem?: PlanItem } | null;

export function InvestmentsSection({ settings, assets, transactions, quotes, snapshots, planItems, incomes }: {
  settings: AppSettings;
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
  snapshots: MarketSnapshot[];
  planItems: PlanItem[];
  incomes: IncomeEvent[];
}) {
  const portfolio = useInvestmentPortfolio(assets, transactions, quotes);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [transactionTarget, setTransactionTarget] = useState<TransactionTarget>(null);
  const [archiveTarget, setArchiveTarget] = useState<Asset | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);

  async function archiveAsset() {
    if (!archiveTarget?.id) return;
    await db.assets.update(archiveTarget.id, { archived: true, updatedAt: new Date().toISOString() });
    setArchiveTarget(null);
  }

  async function deleteTransaction() {
    if (!deleteTransactionId) return;
    const tx = await db.transactions.get(deleteTransactionId);
    await db.transactions.delete(deleteTransactionId);
    if (tx?.planItemId) await syncInvestmentPlanItem(tx.planItemId);
    setDeleteTransactionId(null);
  }

  const activeAsset = transactionTarget?.asset ?? null;
  const activePlan = transactionTarget?.planItem;
  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-semibold text-primary">{T.eyebrow}</div><h1 className="mt-1 text-2xl font-black sm:text-3xl">{T.title}</h1><p className="mt-1 text-sm text-muted-foreground">{T.desc}</p></div><Button onClick={() => { setEditingAsset(null); setAssetDialogOpen(true); }}><RiAddLine />{T.add}</Button></div>
    <div className="grid gap-3 sm:grid-cols-3"><Kpi label={T.value} value={formatMoney(portfolio.totalValue, settings.displayUnit)} /><Kpi label={T.cost} value={formatMoney(portfolio.totalCost, settings.displayUnit)} /><Kpi label={T.pnl} value={formatMoney(portfolio.totalPnl, settings.displayUnit)} accent={portfolio.totalPnl >= 0} /></div>
    {Math.round(portfolio.targetTotal) !== 100 && <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">{T.targetWarning} {formatPercent(portfolio.targetTotal, 0)} {T.targetTail}</div>}
    <PendingPlanPurchases planItems={planItems} incomes={incomes} assets={assets} settings={settings} onBuy={(planItem, asset) => setTransactionTarget({ planItem, asset })} />
    <MarketChartCard settings={settings} snapshots={snapshots} quotes={quotes} />
    <PortfolioTables positions={portfolio.positions} transactions={transactions} assets={assets} settings={settings} onTransaction={(asset) => setTransactionTarget({ asset })} onEditAsset={(asset) => { setEditingAsset(asset); setAssetDialogOpen(true); }} onArchiveAsset={setArchiveTarget} onDeleteTransaction={setDeleteTransactionId} />
    <AssetDialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen} asset={editingAsset} settings={settings} />
    <TransactionDialog asset={activeAsset} onClose={() => setTransactionTarget(null)} suggestedPrice={activeAsset?.symbol ? portfolio.quoteMap.get(activeAsset.symbol)?.priceToman : activeAsset?.manualPriceToman} availableQty={activeAsset ? portfolio.positions.find((position) => position.asset.id === activeAsset.id)?.qty ?? 0 : 0} settings={settings} planItem={activePlan} initialAmount={activePlan ? planRemaining(activePlan) : undefined} incomeId={activePlan?.incomeId} />
    <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{T.archiveTitle}</AlertDialogTitle><AlertDialogDescription>{T.archiveDesc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction onClick={() => void archiveAsset()}>{T.archive}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={deleteTransactionId !== null} onOpenChange={(open) => !open && setDeleteTransactionId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{T.deleteTitle}</AlertDialogTitle><AlertDialogDescription>{T.deleteDesc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction destructive onClick={() => void deleteTransaction()}>{T.delete}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className={cn("mt-2 text-xl font-black", accent !== undefined && (accent ? "text-primary" : "text-destructive"))}>{value}</div></CardContent></Card>;
}
