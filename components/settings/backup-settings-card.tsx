"use client";

import { useRef, useState } from "react";
import { RiArchiveLine, RiDownloadCloud2Line, RiLockPasswordLine, RiUploadCloud2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsField } from "@/components/settings/settings-field";
import { createBackupEnvelope, openBackupEnvelope } from "@/lib/crypto";
import { exportDatabaseObject, importDatabaseObject } from "@/lib/db";
import { toPersianUiError } from "@/lib/errors";

export function BackupSettingsCard() {
  const [backupPassword, setBackupPassword] = useState("");
  const [encryptBackup, setEncryptBackup] = useState(true);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function downloadBackup() {
    try {
      if (encryptBackup && backupPassword.length < 6) {
        setMessage("برای بکاپ رمزنگاری‌شده رمزی با حداقل ۶ کاراکتر وارد کن.");
        return;
      }
      const payload = await exportDatabaseObject();
      const envelope = await createBackupEnvelope(JSON.stringify(payload), encryptBackup ? backupPassword : undefined);
      const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `poolyar-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("بکاپ ساخته شد. فایل را در جای امن نگه دار.");
    } catch (error) {
      setMessage(toPersianUiError(error, "ساخت بکاپ ناموفق بود. دوباره تلاش کن."));
    }
  }

  async function restoreBackup(file?: File) {
    if (!file) return;
    try {
      const envelope = JSON.parse(await file.text());
      if (envelope?.format !== "poolyar-backup" || envelope?.version !== 1) throw new Error("فایل بکاپ معتبر پولم‌کو نیست.");
      const raw = await openBackupEnvelope(envelope, backupPassword || undefined);
      await importDatabaseObject(JSON.parse(raw) as Record<string, unknown>);
      setMessage("بکاپ با موفقیت بازیابی شد.");
    } catch (error) {
      setMessage(toPersianUiError(error, "بازیابی بکاپ ناموفق بود. فایل و رمز را بررسی کن."));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><RiArchiveLine className="text-primary" /> بکاپ و بازیابی</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border p-3">
          <div><div className="type-strong">رمزنگاری بکاپ</div><div className="type-caption text-muted-foreground">AES-GCM با کلید ساخته‌شده از رمز شما</div></div>
          <Switch checked={encryptBackup} onCheckedChange={setEncryptBackup} />
        </div>
        <SettingsField label="رمز بکاپ">
          <div className="relative"><RiLockPasswordLine className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pe-9" type="password" autoComplete="new-password" value={backupPassword} onChange={(event) => setBackupPassword(event.target.value)} placeholder={encryptBackup ? "حداقل ۶ کاراکتر" : "برای بازیابی بکاپ رمزدار"} /></div>
        </SettingsField>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={() => void downloadBackup()}><RiDownloadCloud2Line /> دریافت بکاپ</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><RiUploadCloud2Line /> بازیابی فایل</Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => void restoreBackup(event.target.files?.[0])} />
        {message && <p className="text-xs type-strong text-primary">{message}</p>}
        <p className="text-xs leading-6 text-muted-foreground">اطلاعات مالی در IndexedDB همین دستگاه است. پاک‌کردن داده مرورگر ممکن است اطلاعات محلی را حذف کند.</p>
      </CardContent>
    </Card>
  );
}
