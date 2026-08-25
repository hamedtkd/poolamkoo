"use client";

import { useState } from "react";
import { RiDownloadCloud2Line, RiLockPasswordLine } from "react-icons/ri";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { downloadDatabaseBackup } from "@/lib/backup-client";
import { toPersianUiError } from "@/lib/errors";

export function BackupDownloadDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (open: boolean) => void; onDone?: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function download() {
    try {
      setBusy(true);
      await downloadDatabaseBackup({ encrypted: true, password });
      toast({ tone: "success", title: "بکاپ دانلود شد", description: "فایل رمزنگاری‌شده را بیرون از همین مرورگر هم نگه دار." });
      setPassword("");
      onDone?.();
      onOpenChange(false);
    } catch (error) {
      toast({ tone: "error", title: "بکاپ ساخته نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    } finally {
      setBusy(false);
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>یک بکاپ امن بگیر</DialogTitle><DialogDescription>این فایل شامل داده‌های مالی توست و با AES-GCM رمزنگاری می‌شود. رمز را جایی امن نگه دار؛ پولم‌کو آن را ذخیره نمی‌کند.</DialogDescription></DialogHeader>
    <div className="space-y-4">
      <div><label className="mb-2 block type-label">رمز بکاپ</label><div className="relative"><RiLockPasswordLine className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pe-9" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="حداقل ۶ کاراکتر" /></div></div>
      <Button className="w-full" disabled={busy} onClick={() => void download()}><RiDownloadCloud2Line /> {busy ? "در حال ساخت..." : "دانلود بکاپ رمزنگاری‌شده"}</Button>
    </div>
  </DialogContent></Dialog>;
}
