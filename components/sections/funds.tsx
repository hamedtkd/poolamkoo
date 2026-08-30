"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RiAddLine, RiDeleteBin6Line, RiEditLine, RiFocus3Line, RiSafe2Line, RiShieldCheckLine } from "react-icons/ri";
import { Reveal, RevealGrid } from "@/components/animation/reveal";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { FundEditor } from "@/components/funds/fund-editor";
import { FundMovementDialog } from "@/components/funds/fund-movement";
import { FundMovementHistoryCard } from "@/components/funds/fund-movement-history-card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { Progress } from "@/components/ui/progress";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { toast } from "@/components/ui/toast";
import { db } from "@/lib/db";
import { toPersianUiError } from "@/lib/errors";
import { deleteManualFundMovement } from "@/lib/fund-ledger-store";
import { formatMoney, formatPercent, toPersianDate } from "@/lib/format";
import { planRemaining } from "@/lib/plan-progress";
import { createRecoverySnapshot } from "@/lib/recovery";
import type { AppSettings, FundMovement, GoalFund, PlanItem } from "@/lib/types";

export function FundsSection({ funds, fundMovements, planItems, settings }: {
  funds: GoalFund[];
  fundMovements: FundMovement[];
  planItems: PlanItem[];
  settings: AppSettings;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<GoalFund | null>(null);
  const [moveFund, setMoveFund] = useState<GoalFund | null>(null);
  const [editingMovement, setEditingMovement] = useState<FundMovement | null>(null);
  const [deleteMovement, setDeleteMovement] = useState<FundMovement | null>(null);
  const [deleteFund, setDeleteFund] = useState<GoalFund | null>(null);
  const totalCurrent = funds.reduce((sum, fund) => sum + fund.currentToman, 0);
  const totalTarget = funds.reduce((sum, fund) => sum + fund.targetToman, 0);
  const overall = totalTarget ? totalCurrent / totalTarget * 100 : 0;
  const selectedMovementFund = useMemo(() => editingMovement ? funds.find((fund) => fund.id === editingMovement.fundId) ?? null : moveFund, [editingMovement, funds, moveFund]);
  const deleteFundPendingPlans = deleteFund?.id ? planItems.filter((item) => item.targetType === "fund" && item.targetId === deleteFund.id && planRemaining(item) > 0).length : 0;
  const deleteFundBlocked = Boolean(deleteFund && (deleteFund.currentToman > 0 || deleteFundPendingPlans > 0));

  async function removeFund() {
    if (!deleteFund?.id || deleteFundBlocked) return;
    try {
      await createRecoverySnapshot("قبل از حذف صندوق");
      await db.transaction("rw", db.funds, db.fundMovements, async () => {
        await db.fundMovements.where("fundId").equals(deleteFund.id!).delete();
        await db.funds.delete(deleteFund.id!);
      });
      toast({ tone: "success", title: "صندوق حذف شد", description: "یک نقطه بازیابی محلی از قبل حذف نگه داشتیم." });
      setDeleteFund(null);
    } catch (error) {
      toast({ tone: "error", title: "حذف صندوق انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  }

  async function removeMovement() {
    if (!deleteMovement) return;
    try {
      await createRecoverySnapshot("قبل از حذف گردش صندوق");
      await deleteManualFundMovement(deleteMovement);
      toast({ tone: "success", title: "گردش صندوق حذف شد", description: "موجودی از روی دفتر گردش دوباره محاسبه شد." });
      setDeleteMovement(null);
    } catch (error) {
      toast({ tone: "error", title: "حذف گردش انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  }

  const columns: ColumnDef<DataTableFeatures, GoalFund, unknown>[] = [
    { accessorKey: "name", header: "صندوق", cell: ({ row }) => <div><div className="type-strong">{row.original.name}</div><Badge className="mt-1">{categoryLabel(row.original.category)}</Badge></div> },
    { accessorKey: "currentToman", header: "ذخیره فعلی", cell: ({ row }) => <SensitiveValue className="type-strong">{formatMoney(row.original.currentToman, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "targetToman", header: "هدف", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.targetToman, settings.displayUnit)}</SensitiveValue> },
    { id: "progress", header: "پیشرفت", cell: ({ row }) => <ProgressCell fund={row.original} /> },
    { accessorKey: "dueAt", header: "موعد", cell: ({ row }) => row.original.dueAt ? toPersianDate(row.original.dueAt) : "—" },
    { id: "actions", header: "", cell: ({ row }) => <FundActions fund={row.original} onMove={() => setMoveFund(row.original)} onEdit={() => { setEditing(row.original); setEditorOpen(true); }} onDelete={() => setDeleteFund(row.original)} /> },
  ];

  return <div className="space-y-5">
    <Reveal direction="down" step={1}><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="type-caption type-body-strong text-primary">امنیت و هزینه‌های آینده</div><h1 className="mt-1 type-page-title">صندوق‌ها</h1><p className="mt-1 type-body text-muted-foreground">دندان‌پزشکی، هدیه، بیمه، سفر و اتفاق‌های قابل‌پیش‌بینی را قبل از موعد آرام‌آرام بساز.</p></div><Button onClick={() => { setEditing(null); setEditorOpen(true); }}><RiAddLine /> صندوق جدید</Button></div></Reveal>
    <RevealGrid className="grid gap-3 sm:grid-cols-3" startStep={2}><Kpi icon={<RiSafe2Line />} label="جمع ذخیره" value={formatMoney(totalCurrent, settings.displayUnit)} /><Kpi icon={<RiFocus3Line />} label="جمع هدف‌ها" value={formatMoney(totalTarget, settings.displayUnit)} /><Kpi icon={<RiShieldCheckLine />} label="پیشرفت کل" value={formatPercent(overall, 0)} /></RevealGrid>
    <Reveal step={5}><Card><CardHeader><CardTitle>همه صندوق‌ها</CardTitle></CardHeader><CardContent><DataTable data={funds} columns={columns} searchPlaceholder="جست‌وجوی صندوق..." mobileCard={(fund) => <FundMobileCard fund={fund} settings={settings} onMove={() => setMoveFund(fund)} onEdit={() => { setEditing(fund); setEditorOpen(true); }} onDelete={() => setDeleteFund(fund)} />} /></CardContent></Card></Reveal>
    <Reveal step={6}><FundMovementHistoryCard funds={funds} movements={fundMovements} settings={settings} onEdit={(movement) => { setMoveFund(null); setEditingMovement(movement); }} onDelete={setDeleteMovement} /></Reveal>
    <FundEditor open={editorOpen} onOpenChange={setEditorOpen} fund={editing} settings={settings} />
    <FundMovementDialog fund={selectedMovementFund} movement={editingMovement} onClose={() => { setMoveFund(null); setEditingMovement(null); }} settings={settings} />
    <AlertDialog open={!!deleteMovement} onOpenChange={(open) => !open && setDeleteMovement(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف این گردش صندوق؟</AlertDialogTitle><AlertDialogDescription>فقط گردش دستی حذف می‌شود و موجودی صندوق از کل تاریخچه دوباره محاسبه خواهد شد. اگر حذف باعث موجودی منفی تاریخی شود، عملیات متوقف می‌شود.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction destructive onClick={() => void removeMovement()}>حذف گردش</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={!!deleteFund} onOpenChange={(open) => !open && setDeleteFund(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف صندوق «{deleteFund?.name}»؟</AlertDialogTitle><AlertDialogDescription>{deleteFundBlocked ? fundDeleteBlockerText(deleteFund, deleteFundPendingPlans) : "صندوق و دفتر گردش آن حذف می‌شوند. قبل از حذف یک Recovery Snapshot ساخته می‌شود."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction destructive disabled={deleteFundBlocked} onClick={() => void removeFund()}>حذف صندوق</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function categoryLabel(category: GoalFund["category"]) { return category === "emergency" ? "اضطراری" : category === "planned" ? "هزینه پیش‌رو" : "سفارشی"; }
function fundDeleteBlockerText(fund: GoalFund | null, pending: number) { if ((fund?.currentToman ?? 0) > 0) return "برای حذف صندوق، ابتدا موجودی آن را با برداشت به صفر برسان."; if (pending > 0) return "این صندوق هنوز هدف یک کارت برنامه انجام‌نشده است؛ ابتدا آن کارت را اجرا یا ویرایش کن."; return "حذف صندوق فعلاً ممکن نیست."; }
function ProgressCell({ fund }: { fund: GoalFund }) { const progress = fund.targetToman ? Math.min(100, fund.currentToman / fund.targetToman * 100) : 0; return <div className="min-w-28"><div className="mb-1 text-xs type-strong">{formatPercent(progress, 0)}</div><Progress value={progress} /></div>; }
function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <Card><CardContent className="p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className="mt-2 type-section-title">{value}</SensitiveValue></div><KpiIcon>{icon}</KpiIcon></div></CardContent></Card>; }
function FundActions({ fund, onMove, onEdit, onDelete }: { fund: GoalFund; onMove: () => void; onEdit: () => void; onDelete: () => void }) { return <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={onMove}>واریز / برداشت</Button><Button size="icon" variant="ghost" className="size-8" aria-label={`ویرایش صندوق ${fund.name}`} onClick={onEdit}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label={`حذف صندوق ${fund.name}`} onClick={onDelete}><RiDeleteBin6Line /></Button></div>; }
function FundMobileCard({ fund, settings, onMove, onEdit, onDelete }: { fund: GoalFund; settings: AppSettings; onMove: () => void; onEdit: () => void; onDelete: () => void }) { const progress = fund.targetToman ? Math.min(100, fund.currentToman / fund.targetToman * 100) : 0; return <div className="p-4"><div className="flex justify-between gap-3"><div><div className="type-strong">{fund.name}</div><Badge className="mt-1">{categoryLabel(fund.category)}</Badge></div><div className="text-end"><div className="type-strong text-primary">{formatPercent(progress, 0)}</div><div className="text-[10px] text-muted-foreground">{fund.dueAt ? toPersianDate(fund.dueAt) : "بدون موعد"}</div></div></div><Progress value={progress} className="mt-4" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><SensitiveValue className="text-muted-foreground">{formatMoney(fund.currentToman, settings.displayUnit)}</SensitiveValue><SensitiveValue>{formatMoney(fund.targetToman, settings.displayUnit)}</SensitiveValue></div><div className="mt-3 flex flex-wrap gap-1.5"><Button size="sm" className="min-w-0 flex-1" onClick={onMove}>واریز / برداشت</Button><Button size="sm" variant="ghost" className="min-w-0 flex-1" onClick={onEdit}><RiEditLine /> ویرایش</Button><Button size="sm" variant="ghost" className="text-destructive sm:px-3" aria-label={`حذف صندوق ${fund.name}`} onClick={onDelete}><RiDeleteBin6Line /></Button></div></div>; }
