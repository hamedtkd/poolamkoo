"use client";

import { useMemo, useState } from "react";
import { RiAddLine, RiDownload2Line, RiFileUploadLine, RiHistoryLine } from "react-icons/ri";
import { AssetDialog } from "@/components/investments/asset-dialog";
import { HistoryImportPreview } from "@/components/investments/history-import-preview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { historicalImportSummary, parseHistoricalCsv, prepareHistoricalImport, toInvestmentTransaction, type HistoricalCsvRow } from "@/lib/historical-import";
import type { AppSettings, Asset, InvestmentTransaction } from "@/lib/types";

export function HistoryImportDialog({ open, onOpenChange, assets, transactions, settings }: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  assets: Asset[];
  transactions: InvestmentTransaction[];
  settings: AppSettings;
}) {
  const [rows, setRows] = useState<HistoricalCsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [assetEditorOpen, setAssetEditorOpen] = useState(false);
  const prepared = useMemo(() => prepareHistoricalImport(rows, assets, transactions), [assets, rows, transactions]);
  const summary = useMemo(() => historicalImportSummary(prepared), [prepared]);
  const missingAssets = useMemo(() => [...new Set(prepared.filter((row) => !row.asset && row.assetName).map((row) => row.assetName))], [prepared]);

  function changeOpen(next: boolean) {
    if (!next) {
      setRows([]);
      setFileName("");
      setError("");
      setImportedCount(null);
      setAssetEditorOpen(false);
    }
    onOpenChange(next);
  }

  async function selectFile(file?: File) {
    setError("");
    setImportedCount(null);
    if (!file) return;
    if (file.size > 2_000_000) { setError("حجم فایل نباید بیشتر از ۲ مگابایت باشد."); return; }
    try {
      const parsed = parseHistoricalCsv(await file.text());
      setRows(parsed);
      setFileName(file.name);
    } catch (reason) {
      setRows([]);
      setFileName(file.name);
      setError(reason instanceof Error ? reason.message : "فایل قابل خواندن نیست.");
    }
  }

  async function importRows() {
    const transactionsToAdd = prepared.map((row) => toInvestmentTransaction(row)).filter((row): row is InvestmentTransaction => Boolean(row));
    if (!transactionsToAdd.length) return;
    setImporting(true);
    try {
      await db.transaction("rw", db.transactions, async () => { await db.transactions.bulkAdd(transactionsToAdd); });
      setImportedCount(transactionsToAdd.length);
      setRows([]);
      setFileName("");
    } finally {
      setImporting(false);
    }
  }

  return <>
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader><DialogTitle>ورود سوابق سرمایه‌گذاری</DialogTitle><DialogDescription>خرید و فروش‌های قدیمی را با CSV وارد کن. قبل از ثبت، همه ردیف‌ها بررسی می‌شوند و موارد تکراری دوباره ذخیره نمی‌شوند.</DialogDescription></DialogHeader>
        {importedCount !== null ? <SuccessState count={importedCount} onDone={() => changeOpen(false)} /> : <div className="space-y-5">
          <div className="grid gap-3 rounded-2xl border bg-muted/25 p-4 sm:grid-cols-[1fr_auto] sm:items-end"><div className="space-y-2"><label className="type-body-strong">فایل CSV</label><Input type="file" accept=".csv,text/csv,text/plain" onClick={(event) => { event.currentTarget.value = ""; }} onChange={(event) => void selectFile(event.target.files?.[0])} /><p className="type-caption leading-6 text-muted-foreground">ستون‌های لازم: دارایی، مقدار، قیمت واحد و تاریخ. قیمت فایل همیشه به تومان است. ستون نوع اختیاری است و اگر نباشد همه ردیف‌ها «خرید» در نظر گرفته می‌شوند.</p></div><Button type="button" variant="outline" onClick={downloadTemplate}><RiDownload2Line /> دانلود نمونه CSV</Button></div>
          {error && <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 type-caption type-body-strong text-destructive">{error}</div>}
          {prepared.length > 0 && <>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="type-body-strong">پیش‌نمایش {fileName}</div><div className="mt-1 type-caption text-muted-foreground">{prepared.length.toLocaleString("fa-IR")} ردیف خوانده شد؛ فقط ردیف‌های آماده ثبت وارد می‌شوند.</div></div>{missingAssets.length > 0 && <Button variant="outline" onClick={() => setAssetEditorOpen(true)}><RiAddLine /> ساخت «{missingAssets[0]}»</Button>}</div>
            <Summary valid={summary.valid} invalid={summary.invalid} duplicate={summary.duplicate} />
            {missingAssets.length > 0 && <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 type-caption leading-6">دارایی پیدا نشده: <strong>{missingAssets.join("، ")}</strong>. آن را بساز؛ پیش‌نمایش بدون انتخاب دوباره فایل به‌روزرسانی می‌شود.</div>}
            <HistoryImportPreview rows={prepared} settings={settings} />
            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => { setRows([]); setFileName(""); setError(""); }}>انتخاب فایل دیگر</Button><Button disabled={summary.valid === 0 || importing || summary.invalid > 0} onClick={() => void importRows()}><RiFileUploadLine /> {importing ? "در حال ثبت..." : `ثبت ${summary.valid.toLocaleString("fa-IR")} ردیف معتبر`}</Button></div>
            {summary.invalid > 0 && <p className="type-caption text-destructive">برای جلوگیری از خراب‌شدن سابقه سبد، تا وقتی ردیف نامعتبر وجود دارد ثبت نهایی فعال نمی‌شود.</p>}
          </>}
        </div>}
      </DialogContent>
    </Dialog>
    <AssetDialog open={assetEditorOpen} onOpenChange={setAssetEditorOpen} asset={null} settings={settings} initialName={missingAssets[0]} />
  </>;
}

function Summary({ valid, invalid, duplicate }: { valid: number; invalid: number; duplicate: number }) {
  return <div className="grid grid-cols-3 gap-2"><SummaryItem label="آماده ثبت" value={valid} className="text-primary" /><SummaryItem label="نیاز به اصلاح" value={invalid} className="text-destructive" /><SummaryItem label="تکراری" value={duplicate} /></div>;
}
function SummaryItem({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return <div className="rounded-xl border p-3 text-center"><div className={`type-section-title ${className}`}>{value.toLocaleString("fa-IR")}</div><div className="mt-1 type-caption text-muted-foreground">{label}</div></div>;
}
function SuccessState({ count, onDone }: { count: number; onDone: () => void }) {
  return <div className="grid min-h-64 place-items-center text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><RiHistoryLine className="size-7" /></div><h3 className="mt-4 type-section-title">سوابق وارد شد</h3><p className="mt-2 type-body text-muted-foreground">{count.toLocaleString("fa-IR")} تراکنش جدید به تاریخچه سبد اضافه شد.</p><Button className="mt-5" onClick={onDone}>دیدن سبد</Button></div></div>;
}
function downloadTemplate() {
  const csv = "\uFEFFدارایی,نماد,نوع,مقدار,قیمت واحد تومان,تاریخ,یادداشت\nدلار,USD,خرید,120,85000,1405/03/01,خرید قدیمی";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "poolamkoo-historical-import.csv"; anchor.click(); URL.revokeObjectURL(url);
}
