"use client";

import Link from "next/link";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RiAddLine, RiDeleteBin6Line, RiEditLine, RiFileList3Line } from "react-icons/ri";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { IncomeEditDialog } from "@/components/income/income-edit-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { formatMoney, formatPercent, toPersianDate } from "@/lib/format";
import { incomePlanProgress } from "@/lib/plan-execution";
import type { AllocationEntry, AppSettings, IncomeEvent, PlanItem } from "@/lib/types";

const T = {
  eyebrow: "\u062c\u0631\u06cc\u0627\u0646 \u067e\u0648\u0644",
  title: "\u067e\u0648\u0644\u200c\u0647\u0627\u06cc \u0648\u0631\u0648\u062f\u06cc",
  desc: "\u067e\u0648\u0644 \u0631\u0627 \u062b\u0628\u062a \u06a9\u0646\u060c \u0628\u0639\u062f \u062f\u0631 \u0628\u0631\u0646\u0627\u0645\u0647 \u0647\u0645\u0627\u0646 \u0648\u0631\u0648\u062f\u06cc \u0628\u0628\u06cc\u0646 \u0686\u0642\u062f\u0631 \u0627\u0632 \u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u0631\u0627 \u0648\u0627\u0642\u0639\u0627\u064b \u0627\u062c\u0631\u0627 \u06a9\u0631\u062f\u0647\u200c\u0627\u06cc.",
  add: "\u067e\u0648\u0644 \u062c\u062f\u06cc\u062f",
  name: "\u0639\u0646\u0648\u0627\u0646",
  amount: "\u0645\u0628\u0644\u063a",
  date: "\u062a\u0627\u0631\u06cc\u062e",
  allocation: "\u062a\u0642\u0633\u06cc\u0645",
  progress: "\u0627\u062c\u0631\u0627\u06cc \u0628\u0631\u0646\u0627\u0645\u0647",
  plan: "\u0628\u0631\u0646\u0627\u0645\u0647",
  search: "\u062c\u0633\u062a\u200c\u0648\u062c\u0648\u06cc \u0639\u0646\u0648\u0627\u0646 \u06cc\u0627 \u0645\u0628\u0644\u063a...",
  deleteTitle: "\u062d\u0630\u0641 \u067e\u0648\u0644 \u0648\u0631\u0648\u062f\u06cc\u061f",
  deleteDesc: "\u0627\u06cc\u0646 \u0648\u0631\u0648\u062f\u06cc\u060c \u062a\u0642\u0633\u06cc\u0645\u200c\u0647\u0627 \u0648 \u0628\u0631\u0646\u0627\u0645\u0647 \u0645\u0631\u062a\u0628\u0637 \u062d\u0630\u0641 \u0645\u06cc\u200c\u0634\u0648\u0646\u062f. \u062a\u0631\u0627\u06a9\u0646\u0634\u200c\u0647\u0627\u06cc \u0633\u0631\u0645\u0627\u06cc\u0647\u200c\u06af\u0630\u0627\u0631\u06cc \u062d\u0630\u0641 \u0646\u0645\u06cc\u200c\u0634\u0648\u0646\u062f \u0648 \u0641\u0642\u0637 \u0627\u0632 \u0628\u0631\u0646\u0627\u0645\u0647 \u062c\u062f\u0627 \u0645\u06cc\u200c\u0634\u0648\u0646\u062f.",
  delete: "\u062d\u0630\u0641 \u0648\u0631\u0648\u062f\u06cc",
};

export function IncomeSection({ incomes, allocations, planItems, settings, onNewMoney }: { incomes: IncomeEvent[]; allocations: AllocationEntry[]; planItems: PlanItem[]; settings: AppSettings; onNewMoney: () => void }) {
  const [editing, setEditing] = useState<IncomeEvent | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function remove() {
    if (!deleteId) return;
    await db.transaction("rw", db.incomes, db.allocations, db.planItems, db.transactions, db.funds, async () => {
      const plans = await db.planItems.where("incomeId").equals(deleteId).toArray();
      for (const item of plans) {
        if (item.targetType !== "fund" || !item.targetId || item.executedToman <= 0) continue;
        const fund = await db.funds.get(item.targetId);
        if (fund?.id) await db.funds.update(fund.id, { currentToman: Math.max(0, fund.currentToman - item.executedToman), updatedAt: new Date().toISOString() });
      }
      const linked = await db.transactions.where("incomeId").equals(deleteId).toArray();
      for (const tx of linked) if (tx.id) await db.transactions.update(tx.id, { incomeId: undefined, planItemId: undefined });
      await db.planItems.where("incomeId").equals(deleteId).delete();
      await db.allocations.where("incomeId").equals(deleteId).delete();
      await db.incomes.delete(deleteId);
    });
    setDeleteId(null);
  }

  function allocationText(id?: number) {
    if (!id) return "-";
    const names: Record<string, string> = { life: "\u0632\u0646\u062f\u06af\u06cc", safety: "\u0627\u0645\u0646\u06cc\u062a", growth: "\u0631\u0634\u062f" };
    return allocations.filter((item) => item.incomeId === id).map((item) => `${names[item.bucket]} ${formatMoney(item.amountToman, settings.displayUnit, true)}`).join(" - ");
  }

  function progressFor(id?: number) {
    return incomePlanProgress(planItems.filter((item) => item.incomeId === id));
  }

  const columns: ColumnDef<DataTableFeatures, IncomeEvent, unknown>[] = [
    { accessorKey: "title", header: T.name, cell: ({ row }) => <div className="font-bold">{row.original.title}</div> },
    { accessorKey: "amountToman", header: T.amount, cell: ({ row }) => <div dir="ltr" className="text-end font-black">{formatMoney(row.original.amountToman, settings.displayUnit)}</div> },
    { accessorKey: "happenedAt", header: T.date, cell: ({ row }) => toPersianDate(row.original.happenedAt) },
    { id: "allocation", header: T.allocation, cell: ({ row }) => <span className="text-xs text-muted-foreground">{allocationText(row.original.id)}</span> },
    { id: "progress", header: T.progress, cell: ({ row }) => { const p = progressFor(row.original.id); return <div className="min-w-28"><div className="mb-1 flex justify-between text-[10px]"><span>{formatPercent(p.pct, 0)}</span><span>{formatMoney(p.executed, settings.displayUnit, true)}</span></div><Progress value={p.pct} /></div>; } },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><Link href={`/income/${row.original.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg border px-2 text-xs font-semibold hover:bg-accent"><RiFileList3Line />{T.plan}</Link><Button size="icon" variant="ghost" className="size-8" onClick={() => setEditing(row.original)}><RiEditLine /></Button><Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(row.original.id ?? null)}><RiDeleteBin6Line /></Button></div> },
  ];

  return <div className="space-y-5"><div className="flex items-end justify-between gap-3"><div><div className="text-xs font-semibold text-primary">{T.eyebrow}</div><h1 className="mt-1 text-2xl font-black sm:text-3xl">{T.title}</h1><p className="mt-1 text-sm text-muted-foreground">{T.desc}</p></div><Button onClick={onNewMoney}><RiAddLine />{T.add}</Button></div><div className="rounded-2xl border bg-card p-4 sm:p-5"><DataTable data={incomes} columns={columns} searchPlaceholder={T.search} mobileCard={(row) => <IncomeMobileCard row={row} settings={settings} allocation={allocationText(row.id)} progress={progressFor(row.id)} onEdit={() => setEditing(row)} onDelete={() => setDeleteId(row.id ?? null)} />} /></div><AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{T.deleteTitle}</AlertDialogTitle><AlertDialogDescription>{T.deleteDesc}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction destructive onClick={() => void remove()}>{T.delete}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><IncomeEditDialog editing={editing} allocations={allocations} planItems={planItems} settings={settings} onClose={() => setEditing(null)} /></div>;
}

function IncomeMobileCard({ row, settings, allocation, progress, onEdit, onDelete }: { row: IncomeEvent; settings: AppSettings; allocation: string; progress: ReturnType<typeof incomePlanProgress>; onEdit: () => void; onDelete: () => void }) {
  return <div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-bold">{row.title}</div><div className="mt-1 text-xs text-muted-foreground">{toPersianDate(row.happenedAt)}</div></div><div className="text-end"><div className="font-black">{formatMoney(row.amountToman, settings.displayUnit)}</div><Badge className="mt-1">{formatPercent(progress.pct, 0)}</Badge></div></div><div className="mt-3 border-t pt-3 text-[11px] leading-6 text-muted-foreground">{allocation}</div><Progress value={progress.pct} className="mt-2" /><div className="mt-3 flex flex-wrap justify-end gap-1"><Link href={`/income/${row.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"><RiFileList3Line />{T.plan}</Link><Button size="sm" variant="ghost" onClick={onEdit}><RiEditLine /></Button><Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><RiDeleteBin6Line /></Button></div></div>;
}
