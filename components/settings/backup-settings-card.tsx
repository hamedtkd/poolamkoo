"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { RiArchiveLine, RiDownloadCloud2Line, RiLockPasswordLine, RiUploadCloud2Line } from "react-icons/ri";
import { RecoverySnapshots } from "@/components/settings/recovery-snapshots";
import { SettingsField } from "@/components/settings/settings-field";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { useAppRuntime } from "@/components/app/app-runtime";
import { useStoragePersistence } from "@/hooks/use-storage-persistence";
import { backupHealthLabel } from "@/lib/backup-safety";
import { downloadDatabaseBackup, restoreDatabaseBackup } from "@/lib/backup-client";
import { toPersianUiError } from "@/lib/errors";
import { cn } from "@/lib/utils";

export function BackupSettingsCard() {
  const { backupSafety } = useAppRuntime();
  const storagePersistence = useStoragePersistence();
  const [backupPassword, setBackupPassword] = useState("");
  const [encryptBackup, setEncryptBackup] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function downloadBackup() {
    try {
      setBusy(true);
      await downloadDatabaseBackup({ encrypted: encryptBackup, password: backupPassword });
      toast({ tone: "success", title: "بکاپ دانلود شد", description: "فایل را در یک جای مستقل از مرورگر نگه دار." });
    } catch (error) {
      toast({ tone: "error", title: "ساخت بکاپ ناموفق بود", description: toPersianUiError(error, "دوباره تلاش کن.") });
    } finally {
      setBusy(false);
    }
  }

  async function restoreBackup(file?: File) {
    if (!file) return;
    try {
      setBusy(true);
      const exportedAt = await restoreDatabaseBackup(file, backupPassword || undefined);
      toast({ tone: "success", title: "بکاپ بازیابی شد", description: `نسخه ${new Intl.DateTimeFormat("fa-IR").format(new Date(exportedAt))} با موفقیت برگردانده شد.` });
    } catch (error) {
      toast({ tone: "error", title: "بازیابی بکاپ ناموفق بود", description: toPersianUiError(error, "فایل و رمز را بررسی کن.") });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
      setPendingRestore(null);
    }
  }

  const risky = backupSafety.health.state === "never" || backupSafety.health.state === "due";
  return <Card>
    <CardHeader><CardTitle className="flex items-center gap-2"><RiArchiveLine className="text-primary" /> بکاپ و بازیابی</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className={cn("rounded-2xl border p-3", risky ? "border-amber-500/30 bg-amber-500/7" : "bg-muted/35")}><div className="type-strong">وضعیت بکاپ</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{backupHealthLabel(backupSafety.health)}</p></div>
      <div className="rounded-2xl bg-muted/35 p-3"><div className="type-strong">ماندگاری حافظه مرورگر</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{storagePersistence === "persistent" ? "مرورگر ذخیره مقاوم را تأیید کرده است؛ با این حال بکاپ فایل همچنان لازم است." : storagePersistence === "checking" ? "در حال بررسی وضعیت ذخیره‌سازی..." : "ذخیره مرورگر Best-effort است و ممکن است با پاک‌کردن Site Data از بین برود."}</p></div>
      <div className="flex items-center justify-between rounded-2xl border p-3"><div><div className="type-strong">رمزنگاری بکاپ</div><div className="type-caption text-muted-foreground">AES-GCM با کلیدی که از رمز تو ساخته می‌شود</div></div><Switch checked={encryptBackup} onCheckedChange={setEncryptBackup} /></div>
      <SettingsField label="رمز بکاپ"><div className="relative"><RiLockPasswordLine className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pe-9" type="password" autoComplete="new-password" value={backupPassword} onChange={(event) => setBackupPassword(event.target.value)} placeholder={encryptBackup ? "حداقل ۶ کاراکتر" : "برای بازیابی بکاپ رمزدار"} /></div></SettingsField>
      <div className="grid gap-2 sm:grid-cols-2"><Button disabled={busy} onClick={() => void downloadBackup()}><RiDownloadCloud2Line /> {busy ? "در حال انجام..." : "دریافت بکاپ"}</Button><Button disabled={busy} variant="outline" onClick={() => fileRef.current?.click()}><RiUploadCloud2Line /> بازیابی فایل</Button></div>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => setPendingRestore(event.target.files?.[0] ?? null)} />
      <RecoverySnapshots snapshots={backupSafety.snapshots} />
      <p className="text-xs leading-6 text-muted-foreground">داده اصلی در IndexedDB همین دستگاه است. پاک‌کردن داده مرورگر، خرابی دستگاه یا تعویض دستگاه می‌تواند آن را از بین ببرد؛ بکاپ فایل را بیرون از همین مرورگر نگه دار. <Link href="/data-safety" className="text-primary underline-offset-4 hover:underline">راهنمای ماندگاری داده</Link></p>
      <AlertDialog open={pendingRestore !== null} onOpenChange={(open) => { if (!open) { setPendingRestore(null); if (fileRef.current) fileRef.current.value = ""; } }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>بکاپ جای داده فعلی قرار بگیرد؟</AlertDialogTitle><AlertDialogDescription>قبل از جایگزینی، از وضعیت فعلی یک Recovery Snapshot محلی ساخته می‌شود. اگر فایل رمزدار است، رمز همین فیلد بالا استفاده می‌شود.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel /><AlertDialogAction onClick={() => void restoreBackup(pendingRestore ?? undefined)}>بازیابی بکاپ</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </CardContent>
  </Card>;
}
