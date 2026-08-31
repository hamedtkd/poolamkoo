"use client";

import { useState } from "react";
import type { BackgroundPushControls } from "@/hooks/use-background-push";
import { RiAddLine, RiFileUploadLine, RiFundsLine, RiHistoryLine, RiLineChartLine, RiShoppingBag3Line } from "react-icons/ri";
import { Reveal, RevealGrid } from "@/components/animation/reveal";
import { ArchivedAssetsCard } from "@/components/investments/archived-assets-card";
import { AssetDialog } from "@/components/investments/asset-dialog";
import { MarketAlertDialog } from "@/components/investments/market-alert-dialog";
import { MarketAlertsCard } from "@/components/investments/market-alerts-card";
import { MarketChartCard } from "@/components/investments/market-chart-card";
import { MarketWatchlistCard } from "@/components/investments/market-watchlist-card";
import { OpeningHoldingDialog } from "@/components/investments/opening-holding-dialog";
import { HistoryImportDialog } from "@/components/investments/history-import-dialog";
import { PendingPlanPurchases } from "@/components/investments/pending-plan-purchases";
import { PortfolioDecisionCard } from "@/components/investments/portfolio-decision-card";
import { PortfolioTables } from "@/components/investments/portfolio-tables";
import { TransactionDialog } from "@/components/investments/transaction-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInvestmentPortfolio } from "@/hooks/use-investment-portfolio";
import { db } from "@/lib/db";
import { createRecoverySnapshot } from "@/lib/recovery";
import { toPersianUiError } from "@/lib/errors";
import { formatMoney, formatPercent, formatSignedMoney } from "@/lib/format";
import { assetArchiveBlockers, portfolioRelevantAssets } from "@/lib/asset-lifecycle";
import { investmentLedgerErrorMessage, validateInvestmentLedger } from "@/lib/investment-ledger";
import type { MarketAlertTarget } from "@/lib/market/alerts";
import { planRemaining, syncInvestmentPlanItem } from "@/lib/plan-execution";
import type { AppSettings, Asset, AssetKind, IncomeEvent, InvestmentTransaction, MarketAlert, MarketInstrument, MarketQuote, MarketSnapshot, MarketWatchItem, PlanItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { HelpLabel } from "@/components/ui/help-label";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { toast } from "@/components/ui/toast";

const T = {
  eyebrow: "\u0633\u0628\u062f \u0631\u0634\u062f",
  title: "\u0633\u0631\u0645\u0627\u06cc\u0647\u200c\u06af\u0630\u0627\u0631\u06cc\u200c\u0647\u0627",
  desc: "\u062e\u0631\u06cc\u062f \u0648\u0627\u0642\u0639\u06cc \u0631\u0627 \u062b\u0628\u062a \u06a9\u0646 \u062a\u0627 \u0633\u0648\u062f \u0648 \u0632\u06cc\u0627\u0646 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0628\u0647\u0627\u06cc \u062a\u0645\u0627\u0645\u200c\u0634\u062f\u0647 \u0645\u062d\u0627\u0633\u0628\u0647 \u0634\u0648\u062f.",
  add: "\u062f\u0627\u0631\u0627\u06cc\u06cc \u062c\u062f\u06cc\u062f",
  value: "\u0627\u0631\u0632\u0634 \u0641\u0639\u0644\u06cc",
  cost: "\u0628\u0647\u0627\u06cc \u062e\u0631\u06cc\u062f \u0628\u0627\u0632",
  pnl: "\u0633\u0648\u062f / \u0632\u06cc\u0627\u0646 \u0628\u0627\u0632",
  targetWarning: "\u062c\u0645\u0639 \u0633\u0647\u0645 \u0647\u062f\u0641 \u062f\u0627\u0631\u0627\u06cc\u06cc\u200c\u0647\u0627",
  targetTail: "\u0627\u0633\u062a. \u0628\u0631\u0627\u06cc \u0645\u0642\u0627\u06cc\u0633\u0647 \u062f\u0642\u06cc\u0642 \u062a\u0631\u06a9\u06cc\u0628 \u0633\u0628\u062f\u060c \u062c\u0645\u0639 \u0647\u062f\u0641\u200c\u0647\u0627 \u0631\u0627 \u0628\u0647 \u06f1\u06f0\u06f0\u066a \u0628\u0631\u0633\u0627\u0646.",
  archiveTitle: "\u0622\u0631\u0634\u06cc\u0648 \u062f\u0627\u0631\u0627\u06cc\u06cc\u061f",
  archiveDesc: "\u062f\u0627\u0631\u0627\u06cc\u06cc \u0627\u0632 \u0633\u0628\u062f \u0641\u0639\u0627\u0644 \u067e\u0646\u0647\u0627\u0646 \u0645\u06cc\u200c\u0634\u0648\u062f \u0627\u0645\u0627 \u062a\u0631\u0627\u06a9\u0646\u0634\u200c\u0647\u0627\u06cc \u0642\u0628\u0644\u06cc \u062d\u0630\u0641 \u0646\u0645\u06cc\u200c\u0634\u0648\u0646\u062f.",
  archive: "\u0622\u0631\u0634\u06cc\u0648 \u062f\u0627\u0631\u0627\u06cc\u06cc",
  deleteTitle: "\u062d\u0630\u0641 \u062a\u0631\u0627\u06a9\u0646\u0634\u061f",
  deleteDesc: "\u0627\u06cc\u0646 \u06a9\u0627\u0631 \u0645\u06cc\u0627\u0646\u06af\u06cc\u0646 \u062e\u0631\u06cc\u062f\u060c \u0645\u0648\u062c\u0648\u062f\u06cc\u060c \u0633\u0648\u062f \u0648 \u0632\u06cc\u0627\u0646 \u0648 \u0648\u0636\u0639\u06cc\u062a \u0627\u062c\u0631\u0627\u06cc \u0628\u0631\u0646\u0627\u0645\u0647 \u0631\u0627 \u062a\u063a\u06cc\u06cc\u0631 \u0645\u06cc\u200c\u062f\u0647\u062f.",
  delete: "\u062d\u0630\u0641 \u062a\u0631\u0627\u06a9\u0646\u0634",
};

type TransactionTarget = { asset: Asset; planItem?: PlanItem; transaction?: InvestmentTransaction } | null;

export function InvestmentsSection({ settings, assets, allAssets, archivedAssets, transactions, quotes, snapshots, watchlist, marketAlerts, backgroundPush, planItems, incomes, visibleTransactions, visibleSnapshots, visiblePlanItems, visibleIncomes }: {
  settings: AppSettings;
  assets: Asset[];
  allAssets: Asset[];
  archivedAssets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
  snapshots: MarketSnapshot[];
  watchlist: MarketWatchItem[];
  marketAlerts: MarketAlert[];
  backgroundPush: BackgroundPushControls;
  planItems: PlanItem[];
  incomes: IncomeEvent[];
  visibleTransactions?: InvestmentTransaction[];
  visibleSnapshots?: MarketSnapshot[];
  visiblePlanItems?: PlanItem[];
  visibleIncomes?: IncomeEvent[];
}) {
  const portfolio = useInvestmentPortfolio(portfolioRelevantAssets(allAssets, transactions), transactions, quotes);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [openingHoldingOpen, setOpeningHoldingOpen] = useState(false);
  const [historyImportOpen, setHistoryImportOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [seedInstrument, setSeedInstrument] = useState<MarketInstrument | undefined>();
  const [seedKind, setSeedKind] = useState<AssetKind | undefined>();
  const [transactionTarget, setTransactionTarget] = useState<TransactionTarget>(null);
  const [archiveTarget, setArchiveTarget] = useState<Asset | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);
  const [alertTarget, setAlertTarget] = useState<MarketAlertTarget | null>(null);

  async function archiveAsset() {
    if (!archiveTarget?.id) return;
    const blockers = assetArchiveBlockers(archiveTarget.id, transactions, planItems);
    if (blockers.blocked) {
      toast({ tone: "error", title: "این دارایی هنوز قابل آرشیو نیست", description: archiveBlockerDescription(blockers) });
      return;
    }
    try {
      await createRecoverySnapshot("قبل از آرشیو دارایی");
      await db.assets.update(archiveTarget.id, { archived: true, updatedAt: new Date().toISOString() });
      setArchiveTarget(null);
    } catch (error) {
      toast({ tone: "error", title: "آرشیو دارایی انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  }


  async function restoreAsset(asset: Asset) {
    if (!asset.id) return;
    try {
      await createRecoverySnapshot("قبل از بازگردانی دارایی آرشیوشده");
      await db.assets.update(asset.id, { archived: false, updatedAt: new Date().toISOString() });
      toast({ tone: "success", title: "دارایی به سبد برگشت", description: "تاریخچه قبلی بدون تغییر حفظ شد." });
    } catch (error) {
      toast({ tone: "error", title: "بازگردانی دارایی انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  }

  async function deleteTransaction() {
    if (!deleteTransactionId) return;
    const tx = transactions.find((row) => row.id === deleteTransactionId);
    if (tx) {
      const check = validateInvestmentLedger(transactions.filter((row) => row.assetId === tx.assetId && row.id !== deleteTransactionId));
      const ledgerMessage = investmentLedgerErrorMessage(check);
      if (ledgerMessage) {
        toast({ tone: "error", title: "این تراکنش فعلاً قابل حذف نیست", description: ledgerMessage });
        return;
      }
    }
    try {
      await createRecoverySnapshot("قبل از حذف تراکنش سرمایه‌گذاری");
      const persisted = tx ?? await db.transactions.get(deleteTransactionId);
      await db.transactions.delete(deleteTransactionId);
      if (persisted?.planItemId) await syncInvestmentPlanItem(persisted.planItemId);
      toast({ tone: "success", title: "تراکنش حذف شد", description: "یک نقطه بازیابی محلی از وضعیت قبل حذف نگه داشتیم." });
      setDeleteTransactionId(null);
    } catch (error) {
      toast({ tone: "error", title: "حذف تراکنش انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  }

  const activeAsset = transactionTarget?.asset ?? null;
  const activeTransaction = transactionTarget?.transaction;
  const activePlan = transactionTarget?.planItem ?? (activeTransaction?.planItemId ? planItems.find((item) => item.id === activeTransaction.planItemId) : undefined);
  const activePosition = activeAsset ? portfolio.positions.find((position) => position.asset.id === activeAsset.id) : undefined;
  function editTransaction(transaction: InvestmentTransaction) {
    const asset = allAssets.find((item) => item.id === transaction.assetId);
    if (!asset) {
      toast({ tone: "error", title: "دارایی تراکنش پیدا نشد", description: "این رکورد را از نسخه پشتیبان بررسی کن یا دوباره دارایی را بساز." });
      return;
    }
    const planItem = transaction.planItemId ? planItems.find((item) => item.id === transaction.planItemId) : undefined;
    setTransactionTarget({ asset, planItem, transaction });
  }

  function createAssetFromMarket(instrument: MarketInstrument) {
    setEditingAsset(null);
    setSeedInstrument(instrument);
    setSeedKind(instrument.name.includes("صندوق") ? "fund" : "stock");
    setAssetDialogOpen(true);
  }
  return <div className="space-y-5">
    <Reveal direction="down" step={1}><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="type-caption type-body-strong text-primary">{T.eyebrow}</div><h1 className="mt-1 type-page-title">{T.title}</h1><p className="mt-1 type-body text-muted-foreground">{T.desc}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setHistoryImportOpen(true)}><RiFileUploadLine /> ورود سوابق CSV</Button><Button variant="outline" onClick={() => setOpeningHoldingOpen(true)}><RiHistoryLine /> دارایی قبلی دارم</Button><Button onClick={() => { setEditingAsset(null); setSeedInstrument(undefined); setSeedKind(undefined); setAssetDialogOpen(true); }}><RiAddLine />{T.add}</Button></div></div></Reveal>
    <RevealGrid className="grid gap-3 sm:grid-cols-3" startStep={2} ><Kpi icon={<RiFundsLine />} label={T.value} help="ارزش فعلی همه دارایی‌ها بر اساس مقدار ثبت‌شده و آخرین قیمت بازار." value={formatMoney(portfolio.totalValue, settings.displayUnit)} /><Kpi icon={<RiShoppingBag3Line />} label={T.cost} help="بهای خریدِ مقدار دارایی‌هایی که هنوز در سبد داری." value={formatMoney(portfolio.totalCost, settings.displayUnit)} /><Kpi icon={<RiLineChartLine />} iconTone={portfolio.totalPnl > 0 ? "profit" : portfolio.totalPnl < 0 ? "danger" : "neutral"} label={portfolio.totalPnl > 0 ? "سود باز" : portfolio.totalPnl < 0 ? "زیان باز" : T.pnl} help="سود یا زیان باز شما از قیمت خرید تا قیمت فعلی؛ این عدد تغییر روزانه بازار نیست." value={formatSignedMoney(portfolio.totalPnl, settings.displayUnit)} valueTone={portfolio.totalPnl > 0 ? "profit" : portfolio.totalPnl < 0 ? "loss" : undefined} /></RevealGrid>
    {!portfolio.allocation.targetsValid && <Reveal step={5}><div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">{T.targetWarning} {formatPercent(portfolio.targetTotal, 0)} {T.targetTail}</div></Reveal>}
    <Reveal step={5}><MarketWatchlistCard watchlist={watchlist} quotes={quotes} snapshots={visibleSnapshots ?? snapshots} assets={assets} settings={settings} onCreateAsset={createAssetFromMarket} onCreateAlert={setAlertTarget} /></Reveal>
    <Reveal step={6}><MarketAlertsCard alerts={marketAlerts} quotes={quotes} settings={settings} backgroundPush={backgroundPush} onCreateAlert={setAlertTarget} /></Reveal>
    <Reveal step={7}><PendingPlanPurchases planItems={visiblePlanItems ?? planItems} incomes={visibleIncomes ?? incomes} assets={assets} settings={settings} onBuy={(planItem, asset) => setTransactionTarget({ planItem, asset })} /></Reveal>
    <Reveal step={8}><MarketChartCard settings={settings} snapshots={visibleSnapshots ?? snapshots} quotes={quotes} assets={assets} watchlist={watchlist} /></Reveal>
    <Reveal step={8}><PortfolioDecisionCard review={portfolio.allocation} settings={settings} /></Reveal>
    <Reveal step={8}><PortfolioTables positions={portfolio.positions} allocationRows={portfolio.allocation.rows} transactions={visibleTransactions ?? transactions} assets={allAssets} settings={settings} onTransaction={(asset) => setTransactionTarget({ asset })} onEditAsset={(asset) => { setEditingAsset(asset); setSeedInstrument(undefined); setSeedKind(undefined); setAssetDialogOpen(true); }} onArchiveAsset={setArchiveTarget} onRestoreAsset={(asset) => void restoreAsset(asset)} onEditTransaction={editTransaction} onDeleteTransaction={setDeleteTransactionId} /></Reveal>
    <Reveal step={9}><ArchivedAssetsCard assets={archivedAssets} transactions={transactions} planItems={planItems} onRestore={(asset) => void restoreAsset(asset)} /></Reveal>
    <AssetDialog open={assetDialogOpen} onOpenChange={(open) => { setAssetDialogOpen(open); if (!open) { setSeedInstrument(undefined); setSeedKind(undefined); } }} asset={editingAsset} settings={settings} initialInstrument={seedInstrument} initialKind={seedKind} />
    <OpeningHoldingDialog open={openingHoldingOpen} onOpenChange={setOpeningHoldingOpen} assets={assets} settings={settings} />
    <HistoryImportDialog open={historyImportOpen} onOpenChange={setHistoryImportOpen} assets={assets} transactions={transactions} settings={settings} />
    <MarketAlertDialog open={!!alertTarget} target={alertTarget} settings={settings} onOpenChange={(open) => !open && setAlertTarget(null)} />
    <TransactionDialog asset={activeAsset} onClose={() => setTransactionTarget(null)} suggestedPrice={activePosition?.pricingReliable ? activePosition.price : activeAsset?.manualPriceToman} settings={settings} planItem={activePlan} initialAmount={activeTransaction ? undefined : activePlan ? planRemaining(activePlan) : undefined} incomeId={activePlan?.incomeId} transaction={activeTransaction} transactions={transactions} />
    <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{T.archiveTitle}</AlertDialogTitle><AlertDialogDescription>{archiveTarget?.id ? archiveBlockerDescription(assetArchiveBlockers(archiveTarget.id, transactions, planItems), T.archiveDesc) : T.archiveDesc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction disabled={archiveTarget?.id ? assetArchiveBlockers(archiveTarget.id, transactions, planItems).blocked : true} onClick={() => void archiveAsset()}>{T.archive}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={deleteTransactionId !== null} onOpenChange={(open) => !open && setDeleteTransactionId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{T.deleteTitle}</AlertDialogTitle><AlertDialogDescription>{T.deleteDesc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction destructive onClick={() => void deleteTransaction()}>{T.delete}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function archiveBlockerDescription(blockers: ReturnType<typeof assetArchiveBlockers>, fallback?: string) {
  if (blockers.openQuantity > 0 && blockers.pendingPlanCount > 0) return "این دارایی هنوز موجودی باز و برنامه مالی انجام‌نشده دارد. ابتدا هر دو را تعیین‌تکلیف کن.";
  if (blockers.openQuantity > 0) return "تا وقتی موجودی این دارایی صفر نشده، آرشیو آن می‌تواند ارزش سبد را پنهان کند. ابتدا موقعیت را ببند یا اصلاح کن.";
  if (blockers.pendingPlanCount > 0) return "یک یا چند آیتم برنامه مالی هنوز به این دارایی متصل است. ابتدا برنامه را اجرا یا ویرایش کن.";
  return fallback ?? "دارایی آماده آرشیو است.";
}

function Kpi({ icon, iconTone = "primary", label, value, help, valueTone }: { icon: React.ReactNode; iconTone?: "primary" | "profit" | "danger" | "neutral"; label: string; value: string; help: string; valueTone?: "profit" | "loss" }) {
  return <Card><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="type-caption text-muted-foreground"><HelpLabel label={label} help={help} /></div><SensitiveValue className={cn("mt-2 type-section-title", valueTone === "profit" && "text-profit", valueTone === "loss" && "text-loss")}>{value}</SensitiveValue></div><KpiIcon tone={iconTone}>{icon}</KpiIcon></div></CardContent></Card>;
}
