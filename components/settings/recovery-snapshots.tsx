"use client";

import { useState } from "react";
import { RiHistoryLine, RiRestartLine } from "react-icons/ri";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createRecoverySnapshot, restoreRecoverySnapshot } from "@/lib/recovery";
import { toPersianUiError } from "@/lib/errors";
import { toPersianDate } from "@/lib/format";
import type { RecoverySnapshot } from "@/lib/types";

export function RecoverySnapshots({ snapshots }: { snapshots: RecoverySnapshot[] }) {
  const [restoreId, setRestoreId] = useState<number | null>(null);

  async function createManual() {
    try {
      await createRecoverySnapshot("نقطه بازیابی دستی");
      toast({ tone: "success", title: "نقطه بازیابی ساخته شد", description: "این نسخه فقط داخل همین مرورگر نگه داشته می‌شود." });
    } catch (error) {
      toast({ tone: "error", title: "ساخت نقطه بازیابی ناموفق بود", description: toPersianUiError(error, "دوباره تلاش کن.") });
    }
  }

  async function restore() {
    if (!restoreId) return;
    try {
      await restoreRecoverySnapshot(restoreId);
      toast({ tone: "success", title: "نقطه بازیابی برگردانده شد", description: "یک نقطه جدید هم از وضعیت قبل از بازیابی نگه داشتیم." });
    } catch (error) {
      toast({ tone: "error", title: "بازیابی ناموفق بود", description: toPersianUiError(error, "نقطه بازیابی را دوباره بررسی کن.") });
    } finally {
      setRestoreId(null);
    }
  }

  return <div className="space-y-3 rounded-2xl border p-3">
    <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 type-strong"><RiHistoryLine className="text-primary" /> نقاط بازیابی محلی</div><p className="mt-1 text-xs leading-5 text-muted-foreground">حداکثر ۵ نسخه اخیر نگه داشته می‌شود. این‌ها برای برگشت از حذف یا بازیابی اشتباه‌اند و جای بکاپ فایل را نمی‌گیرند.</p></div><Button size="sm" variant="outline" onClick={() => void createManual()}>ساخت نقطه</Button></div>
    {snapshots.length ? <div className="space-y-2">{snapshots.map((snapshot) => <div key={snapshot.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/45 px-3 py-2"><div className="min-w-0"><div className="truncate text-xs type-strong">{snapshot.reason}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{toPersianDate(snapshot.createdAt)} · {new Intl.NumberFormat("fa-IR").format(snapshot.itemCount)} رکورد مالی</div></div><Button size="sm" variant="ghost" disabled={!snapshot.id} onClick={() => snapshot.id && setRestoreId(snapshot.id)}><RiRestartLine /> بازگردانی</Button></div>)}</div> : <p className="text-xs text-muted-foreground">هنوز نقطه بازیابی ساخته نشده است.</p>}
    <AlertDialog open={restoreId !== null} onOpenChange={(open) => !open && setRestoreId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>بازگشت به این نقطه؟</AlertDialogTitle><AlertDialogDescription>داده فعلی با این نسخه جایگزین می‌شود. قبل از انجام کار، پولم‌کو از وضعیت فعلی یک نقطه بازیابی جدید می‌سازد.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction onClick={() => void restore()}>بازگردانی</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
