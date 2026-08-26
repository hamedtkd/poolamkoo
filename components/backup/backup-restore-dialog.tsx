"use client";

import { useRef, useState } from "react";
import { RiArchiveLine, RiFileShield2Line, RiLockPasswordLine, RiRestartLine, RiUploadCloud2Line } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { inspectDatabaseBackup, restoreDatabaseBackup, type BackupInspection } from "@/lib/backup-client";
import { toPersianUiError } from "@/lib/errors";

function Count({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-muted/45 px-3 py-2"><div className="text-[10px] text-muted-foreground">{label}</div><div className="mt-0.5 type-strong">{new Intl.NumberFormat("fa-IR").format(value)}</div></div>;
}

export function BackupRestoreDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [inspection, setInspection] = useState<BackupInspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() { setFile(null); setPassword(""); setInspection(null); setError(null); if (fileRef.current) fileRef.current.value = ""; }
  function changeOpen(next: boolean) { if (!next) reset(); onOpenChange(next); }

  async function inspect() {
    if (!file) { setError("ابتدا فایل بکاپ را انتخاب کن."); return; }
    try {
      setBusy(true); setError(null);
      setInspection(await inspectDatabaseBackup(file, password || undefined));
    } catch (reason) {
      setInspection(null);
      setError(toPersianUiError(reason, "فایل یا رمز بکاپ را بررسی کن."));
    } finally { setBusy(false); }
  }

  async function restore() {
    if (!file || !inspection) return;
    try {
      setBusy(true); setError(null);
      const restored = await restoreDatabaseBackup(file, password || undefined);
      toast({ tone: "success", title: "بکاپ بازیابی شد", description: `نسخه ${new Intl.DateTimeFormat("fa-IR").format(new Date(restored.exportedAt))} با موفقیت برگردانده شد.` });
      changeOpen(false);
    } catch (reason) {
      setError(toPersianUiError(reason, "بازیابی انجام نشد؛ فایل و رمز را دوباره بررسی کن."));
    } finally { setBusy(false); }
  }

  const p = inspection?.preview;
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent>
    <DialogHeader><DialogTitle>بازیابی بکاپ با پیش‌نمایش</DialogTitle><DialogDescription>قبل از جایگزینی داده، فایل و سازگاری نسخه بررسی می‌شود و تعداد رکوردهای اصلی را می‌بینی.</DialogDescription></DialogHeader>
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setInspection(null); setError(null); }} />
      <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition hover:bg-accent/60">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><RiUploadCloud2Line className="size-5" /></span>
        <span className="min-w-0 flex-1"><span className="block type-strong">{file ? file.name : "انتخاب فایل بکاپ"}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">JSON خروجی پولم‌کو؛ فایل رمزدار و نسخه قدیمی پشتیبانی می‌شود.</span></span>
      </button>
      <div><label className="mb-2 block type-label">رمز فایل، اگر رمزدار است</label><div className="relative"><RiLockPasswordLine className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pe-9" type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setInspection(null); setError(null); }} placeholder="رمز بکاپ" /></div></div>
      {!inspection && <Button className="w-full" variant="outline" disabled={busy || !file} onClick={() => void inspect()}><RiFileShield2Line /> {busy ? "در حال بررسی..." : "بررسی صحت و پیش‌نمایش"}</Button>}
      {error && <div role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-3 text-xs leading-6 text-destructive">{error}</div>}
      {inspection && p && <div className="space-y-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3">
        <div className="flex flex-wrap items-center gap-2"><Badge><RiArchiveLine /> بکاپ معتبر</Badge><Badge>{inspection.encrypted ? "رمزنگاری‌شده" : "بدون رمز"}</Badge><Badge>{inspection.compatibility === "legacy" ? "فرمت قدیمی سازگار" : inspection.compatibility === "older" ? "ساختار قدیمی سازگار" : "ساختار فعلی"}</Badge></div>
        <div className="text-xs leading-6 text-muted-foreground">تاریخ خروجی: {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(inspection.exportedAt))}{inspection.appVersion ? ` · نسخه برنامه ${inspection.appVersion}` : ""}</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Count label="پول‌های ورودی" value={p.incomes} /><Count label="صندوق‌ها" value={p.funds} /><Count label="دارایی‌ها" value={p.assets} /><Count label="تراکنش‌ها" value={p.transactions} /></div>
        <div className="text-xs leading-6 text-muted-foreground">مجموع رکوردهای تصمیم‌ساز در پیش‌نمایش: {new Intl.NumberFormat("fa-IR").format(p.total)}. Market cache قابل بازسازی است و معیار اصلی این عدد نیست.</div>
        <div className="rounded-xl bg-background/70 p-3 text-xs leading-6 text-muted-foreground"><RiRestartLine className="ms-1 inline text-primary" /> قبل از جایگزینی، پولم‌کو از وضعیت فعلی یک Recovery Snapshot محلی می‌سازد.</div>
        <Button className="w-full" disabled={busy} onClick={() => void restore()}>{busy ? "در حال بازیابی..." : "بازیابی همین نسخه"}</Button>
      </div>}
    </div>
  </DialogContent></Dialog>;
}
