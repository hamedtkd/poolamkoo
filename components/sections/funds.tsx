"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RiAddLine, RiDeleteBin6Line, RiEditLine, RiFocus3Line, RiSafe2Line, RiShieldCheckLine } from "react-icons/ri";
import { Reveal, RevealGrid } from "@/components/animation/reveal";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { FundEditor } from "@/components/funds/fund-editor";
import { FundMovement } from "@/components/funds/fund-movement";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { createRecoverySnapshot } from "@/lib/recovery";
import { toPersianUiError } from "@/lib/errors";
import { formatMoney, formatPercent, toPersianDate } from "@/lib/format";
import type { AppSettings, GoalFund } from "@/lib/types";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { toast } from "@/components/ui/toast";

export function FundsSection({ funds, settings }: { funds: GoalFund[]; settings: AppSettings }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<GoalFund | null>(null);
  const [moveFund, setMoveFund] = useState<GoalFund | null>(null);
  const [deleteFund, setDeleteFund] = useState<GoalFund | null>(null);
  const totalCurrent = funds.reduce((sum, fund) => sum + fund.currentToman, 0);
  const totalTarget = funds.reduce((sum, fund) => sum + fund.targetToman, 0);
  const overall = totalTarget ? totalCurrent / totalTarget * 100 : 0;

  async function remove() {
    if (!deleteFund?.id) return;
    try {
      await createRecoverySnapshot("قبل از حذف صندوق");
      await db.funds.delete(deleteFund.id);
      toast({ tone: "success", title: "صندوق حذف شد", description: "یک نقطه بازیابی محلی از قبل حذف نگه داشتیم." });
      setDeleteFund(null);
    } catch (error) {
      toast({ tone: "error", title: "حذف صندوق انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  }

  const columns: ColumnDef<DataTableFeatures, GoalFund, unknown>[] = [
    { accessorKey: "name", header: "صندوق", cell: ({ row }) => <div><div className="type-strong">{row.original.name}</div><Badge className="mt-1">{categoryLabel(row.original.category)}</Badge></div> },
    { accessorKey: "currentToman", header: "ذخیره فعلی", cell: ({ row }) => <SensitiveValue className="type-strong">{formatMoney(row.original.currentToman, settings.displayUnit)}</SensitiveValue> },
    { accessorKey: "targetToman", header: "هدف", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.targetToman, settings.displayUnit)}</SensitiveValue> },
    { id: "progress", header: "پیشرفت", cell: ({ row }) => <ProgressCell fund={row.original} /> },
    { accessorKey: "dueAt", header: "موعد", cell: ({ row }) => row.original.dueAt ? toPersianDate(row.original.dueAt) : "—" },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => setMoveFund(row.original)}>واریز / برداشت</Button><Button size="icon" variant="ghost" className="size-8" aria-label={`ویرایش صندوق ${row.original.name}`} onClick={() => { setEditing(row.original); setEditorOpen(true); }}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label={`حذف صندوق ${row.original.name}`} onClick={() => setDeleteFund(row.original)}><RiDeleteBin6Line /></Button></div> },
  ];

  return <div className="space-y-5">
    <Reveal direction="down" step={1}><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="type-caption type-body-strong text-primary">امنیت و هزینه‌های آینده</div><h1 className="mt-1 type-page-title">صندوق‌ها</h1><p className="mt-1 type-body text-muted-foreground">دندان‌پزشکی، هدیه، بیمه، سفر و اتفاق‌های قابل‌پیش‌بینی را قبل از موعد آرام‌آرام بساز.</p></div><Button onClick={() => { setEditing(null); setEditorOpen(true); }}><RiAddLine /> صندوق جدید</Button></div></Reveal>
    <RevealGrid className="grid gap-3 sm:grid-cols-3" startStep={2}><Kpi icon={<RiSafe2Line />} label="جمع ذخیره" value={formatMoney(totalCurrent, settings.displayUnit)} /><Kpi icon={<RiFocus3Line />} label="جمع هدف‌ها" value={formatMoney(totalTarget, settings.displayUnit)} /><Kpi icon={<RiShieldCheckLine />} label="پیشرفت کل" value={formatPercent(overall, 0)} /></RevealGrid>
    <Reveal step={5}><Card><CardHeader><CardTitle>همه صندوق‌ها</CardTitle></CardHeader><CardContent><DataTable data={funds} columns={columns} searchPlaceholder="جست‌وجوی صندوق..." mobileCard={(fund) => <FundMobileCard fund={fund} settings={settings} onMove={() => setMoveFund(fund)} onEdit={() => { setEditing(fund); setEditorOpen(true); }} onDelete={() => setDeleteFund(fund)} />} /></CardContent></Card></Reveal>
    <FundEditor open={editorOpen} onOpenChange={setEditorOpen} fund={editing} settings={settings} />
    <FundMovement fund={moveFund} onClose={() => setMoveFund(null)} settings={settings} />
    <AlertDialog open={!!deleteFund} onOpenChange={(open) => !open && setDeleteFund(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف صندوق «{deleteFund?.name}»؟</AlertDialogTitle><AlertDialogDescription>موجودی و هدف این صندوق از برنامه حذف می‌شود.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction destructive onClick={() => void remove()}>حذف صندوق</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function categoryLabel(category: GoalFund["category"]) { return category === "emergency" ? "اضطراری" : category === "planned" ? "هزینه پیش‌رو" : "سفارشی"; }
function ProgressCell({ fund }: { fund: GoalFund }) { const progress = fund.targetToman ? Math.min(100, fund.currentToman / fund.targetToman * 100) : 0; return <div className="min-w-28"><div className="mb-1 text-xs type-strong">{formatPercent(progress, 0)}</div><Progress value={progress} /></div>; }
function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <Card><CardContent className="p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className="mt-2 type-section-title">{value}</SensitiveValue></div><KpiIcon>{icon}</KpiIcon></div></CardContent></Card>; }
function FundMobileCard({ fund, settings, onMove, onEdit, onDelete }: { fund: GoalFund; settings: AppSettings; onMove: () => void; onEdit: () => void; onDelete: () => void }) { const progress = fund.targetToman ? Math.min(100, fund.currentToman / fund.targetToman * 100) : 0; return <div className="p-4"><div className="flex justify-between gap-3"><div><div className="type-strong">{fund.name}</div><Badge className="mt-1">{categoryLabel(fund.category)}</Badge></div><div className="text-end"><div className="type-strong text-primary">{formatPercent(progress, 0)}</div><div className="text-[10px] text-muted-foreground">{fund.dueAt ? toPersianDate(fund.dueAt) : "بدون موعد"}</div></div></div><Progress value={progress} className="mt-4" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><SensitiveValue className="text-muted-foreground">{formatMoney(fund.currentToman, settings.displayUnit)}</SensitiveValue><SensitiveValue>{formatMoney(fund.targetToman, settings.displayUnit)}</SensitiveValue></div><div className="mt-3 flex flex-wrap gap-1.5"><Button size="sm" className="min-w-0 flex-1" onClick={onMove}>واریز / برداشت</Button><Button size="sm" variant="ghost" className="min-w-0 flex-1" onClick={onEdit}><RiEditLine /> ویرایش</Button><Button size="sm" variant="ghost" className="text-destructive sm:px-3" aria-label={`حذف صندوق ${fund.name}`} onClick={onDelete}><RiDeleteBin6Line /></Button></div></div>; }