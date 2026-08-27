"use client";

import { RiDownload2Line, RiFileCopyLine, RiShareForwardLine, RiShieldCheckLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { buildReportCsv, buildReportShareText, reportExportFilename, type ReportExportInput } from "@/lib/report-export";

export function ReportExportDialog({ open, onOpenChange, report }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportExportInput;
}) {
  const shareText = buildReportShareText(report);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(shareText);
      toast({ tone: "success", title: "خلاصه کپی شد", description: "این نسخه مبلغ‌ها و نام دارایی‌ها را ندارد." });
    } catch {
      toast({ tone: "error", title: "کپی خودکار ممکن نشد", description: "از گزینه اشتراک سیستم یا دانلود CSV استفاده کن." });
    }
  }

  async function shareSummary() {
    if (!navigator.share) {
      await copySummary();
      return;
    }
    try {
      await navigator.share({ title: "خلاصه تصمیمی پولم‌کو", text: shareText });
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        toast({ tone: "error", title: "اشتراک انجام نشد", description: "می‌توانی خلاصه را کپی کنی." });
      }
    }
  }

  function downloadCsv() {
    const csv = `\uFEFF${buildReportCsv(report)}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = reportExportFilename("csv");
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    toast({ tone: "success", title: "CSV ساخته شد", description: "فایل فقط روی دستگاه تو ساخته شد و شامل جزئیات مالی این گزارش است." });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <div data-report-export-dialog="true">
        <DialogHeader>
          <DialogTitle>خروجی و اشتراک گزارش</DialogTitle>
          <DialogDescription>خودت انتخاب می‌کنی چه سطحی از اطلاعات از دستگاه خارج شود.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <section className="rounded-2xl border bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><RiShieldCheckLine className="size-5" /></span>
              <div className="min-w-0">
                <h3 className="type-card-title">خلاصه مناسب اشتراک</h3>
                <p className="mt-1 type-caption leading-6 text-muted-foreground">فقط درصد اجرای برنامه، پوشش صندوق‌ها و نسبت‌های قانون پول؛ بدون مبلغ و بدون نام دارایی.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button type="button" onClick={() => void shareSummary()}><RiShareForwardLine /> اشتراک</Button>
              <Button type="button" variant="outline" onClick={() => void copySummary()}><RiFileCopyLine /> کپی</Button>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4">
            <h3 className="type-card-title">CSV کامل برای خودت</h3>
            <p className="mt-1 type-caption leading-6 text-muted-foreground">شامل مبلغ‌های گزارش، وضعیت قانون پول و نام/ارزش دارایی‌های سبد است. تراکنش خام یا اطلاعات بکاپ داخل فایل نمی‌رود.</p>
            <Button type="button" variant="outline" className="mt-4 w-full" onClick={downloadCsv}><RiDownload2Line /> دانلود CSV</Button>
          </section>
        </div>

        <p className="type-caption leading-6 text-muted-foreground">پولم‌کو فایل را محلی می‌سازد. فقط اگر «اشتراک» را بزنی، متن خلاصه به Share Sheet سیستم‌عامل تحویل داده می‌شود.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
