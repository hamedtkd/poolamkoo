"use client";

import { useEffect, useState } from "react";
import { RiDatabase2Line, RiRefreshLine, RiShieldCheckLine, RiToolsLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { type DataHealthIssue, type DataHealthReport } from "@/lib/data-health";
import { readLocalDataHealth, repairSafeLocalDataHealth } from "@/lib/data-health-store";
import { toPersianUiError } from "@/lib/errors";
import { cn } from "@/lib/utils";

export function DataHealthCard() {
  const [report, setReport] = useState<DataHealthReport | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void readLocalDataHealth().then((next) => active && setReport(next)).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function refresh() {
    try {
      setBusy(true);
      setReport(await readLocalDataHealth());
    } catch (error) {
      toast({ tone: "error", title: "بررسی سلامت داده انجام نشد", description: toPersianUiError(error, "دوباره تلاش کن.") });
    } finally { setBusy(false); }
  }

  async function repair() {
    try {
      setBusy(true);
      const result = await repairSafeLocalDataHealth();
      setReport(result.report);
      toast({
        tone: "success",
        title: result.repaired ? "ترمیم امن انجام شد" : "مورد قابل ترمیمی نبود",
        description: result.repaired ? `${new Intl.NumberFormat("fa-IR").format(result.repaired)} خلاصه محاسباتی از روی Ledger معتبر همگام شد.` : "هیچ رکورد مالی حذف یا بازنویسی نشد.",
      });
    } catch (error) {
      toast({ tone: "error", title: "ترمیم امن انجام نشد", description: toPersianUiError(error, "داده تغییر نکرد؛ دوباره بررسی کن.") });
    } finally { setBusy(false); }
  }

  const status = statusMeta(report);
  return <Card id="local-data-health" className="scroll-mt-24">
    <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><RiDatabase2Line className="text-primary" /> سلامت داده محلی</CardTitle><Badge className={status.className}>{status.label}</Badge></div></CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-2xl border bg-background/70 p-3">
        <div className="type-strong">بررسی سازگاری بدون خروج داده از دستگاه</div>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">دفتر صندوق، تاریخچه سرمایه‌گذاری، لینک‌های برنامه و پول ورودی، دارایی‌های آرشیوشده و هویت‌های ذخیره‌شده بررسی می‌شوند. هیچ مبلغ یا رکوردی برای این بررسی به سرور ارسال نمی‌شود.</p>
        {report && <p className="mt-1 type-caption text-muted-foreground">آخرین بررسی: {formatCheckedAt(report.checkedAt)}</p>}
      </div>

      {report ? <>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="خطای جدی" value={report.errors} tone={report.errors ? "error" : undefined} />
          <Metric label="نیاز به توجه" value={report.warnings} tone={report.warnings ? "warning" : undefined} />
          <Metric label="قابل ترمیم امن" value={report.repairable} tone={report.repairable ? "repair" : undefined} />
        </div>
        {report.issues.length ? <IssueList issues={report.issues} /> : <div className="flex gap-2 rounded-2xl border border-primary/20 bg-primary/6 p-3 text-xs leading-6 text-muted-foreground"><RiShieldCheckLine className="mt-0.5 size-4 shrink-0 text-primary" /><span>ناسازگاری شناخته‌شده‌ای پیدا نشد. این بررسی جای بکاپ مستقل را نمی‌گیرد.</span></div>}
      </> : <p className="rounded-2xl bg-muted/35 p-3 text-xs leading-6 text-muted-foreground">در حال بررسی اولیه داده محلی…</p>}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" disabled={busy} onClick={() => void refresh()}><RiRefreshLine className={cn(busy && "animate-spin")} /> بررسی دوباره</Button>
        <Button type="button" disabled={busy || !report?.repairable} onClick={() => void repair()}><RiToolsLine /> ترمیم موارد قابل بازسازی</Button>
      </div>
      <p className="type-caption leading-5 text-muted-foreground">ترمیم خودکار فقط فیلدهای محاسباتی قابل بازسازی را از Ledger معتبر همگام می‌کند و قبل از نوشتن Recovery Snapshot می‌سازد. رکوردهای orphan، تاریخچه منفی یا لینک‌های مبهم خودکار حذف نمی‌شوند.</p>
    </CardContent>
  </Card>;
}

function IssueList({ issues }: { issues: DataHealthIssue[] }) {
  const visible = issues.slice(0, 6);
  return <div className="space-y-2" aria-label="موارد سلامت داده">{visible.map((row, index) => <div key={`${row.code}-${index}`} className={cn("rounded-2xl border p-3", row.severity === "error" ? "border-destructive/25 bg-destructive/5" : "border-amber-500/25 bg-amber-500/7")}><div className="flex items-start justify-between gap-3"><div className="type-strong">{row.title}</div><Badge className={cn(row.severity === "error" ? "border-destructive/30 bg-destructive/8 text-destructive" : "border-amber-500/30 bg-amber-500/10", row.repairable && "text-primary")}>{row.repairable ? "قابل ترمیم" : row.severity === "error" ? "خطا" : "توجه"}</Badge></div><p className="mt-1 text-xs leading-6 text-muted-foreground">{row.detail}</p></div>)}{issues.length > visible.length && <p className="type-caption text-muted-foreground">و {new Intl.NumberFormat("fa-IR").format(issues.length - visible.length)} مورد دیگر؛ بعد از اصلاح موارد بالا دوباره بررسی کن.</p>}</div>;
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "error" | "warning" | "repair" }) {
  return <div className={cn("rounded-xl border bg-background/60 p-3", tone === "error" && "border-destructive/25", tone === "warning" && "border-amber-500/25", tone === "repair" && "border-primary/25")}><div className="text-[10px] text-muted-foreground">{label}</div><div className={cn("mt-1 type-strong", tone === "error" && "text-destructive", tone === "warning" && "text-amber-700 dark:text-amber-300", tone === "repair" && "text-primary")}>{new Intl.NumberFormat("fa-IR").format(value)}</div></div>;
}

function statusMeta(report: DataHealthReport | null) {
  if (!report) return { label: "در حال بررسی", className: "" };
  if (report.status === "critical") return { label: "نیاز به بررسی", className: "border-destructive/30 bg-destructive/8 text-destructive" };
  if (report.status === "attention") return { label: "نیاز به توجه", className: "border-amber-500/30 bg-amber-500/10" };
  return { label: "سالم", className: "border-primary/25 bg-primary/8 text-primary" };
}

function formatCheckedAt(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(date) : "اکنون";
}
