"use client";

import { useState } from "react";
import { RiArchiveLine, RiTimeLine } from "react-icons/ri";
import type { useBackupSafety } from "@/hooks/use-backup-safety";
import { BackupDownloadDialog } from "@/components/backup/backup-download-dialog";
import { Button } from "@/components/ui/button";
import { backupHealthLabel } from "@/lib/backup-safety";

export function BackupReminder({ backup }: { backup: ReturnType<typeof useBackupSafety> }) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [hiddenForSession, setHiddenForSession] = useState(false);
  if (!backup.health.shouldRemind || hiddenForSession) return null;

  async function later() {
    await backup.snoozeReminder();
    setHiddenForSession(true);
  }

  return <>
    <aside className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur md:bottom-5 md:left-5 md:right-auto md:w-[390px]" role="status">
      <div className="flex gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><RiArchiveLine className="size-5" /></div><div className="min-w-0 flex-1"><div className="type-strong">یک نسخه بیرون از مرورگر داشته باش</div><p className="mt-1 text-xs leading-6 text-muted-foreground">{backupHealthLabel(backup.health)}. نقطه‌های بازیابی محلی در برابر پاک‌شدن داده مرورگر محافظتت نمی‌کنند.</p></div></div>
      <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => setDownloadOpen(true)}>بکاپ امن</Button><Button size="sm" variant="ghost" onClick={() => void later()}><RiTimeLine /> سه روز بعد</Button></div>
    </aside>
    <BackupDownloadDialog open={downloadOpen} onOpenChange={setDownloadOpen} onDone={() => setHiddenForSession(true)} />
  </>;
}
