"use client";

import { RiAlarmWarningLine, RiNotification3Line, RiShieldCheckLine, RiStockLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoanRiskControls } from "@/hooks/use-loan-risk";
import type { LoanView } from "@/lib/loans/analytics";
import { observeLoanRisk } from "@/lib/loans/risk";
import type { LoanRiskAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LoanRiskCard({ view, risk }: { view: LoanView; risk: LoanRiskControls }) {
  const summary = risk.forLoan(view.loan.id);
  const alerts = risk.alertsForLoan(view.loan.id);
  if (!summary) return null;
  const reserve = alerts.find((row) => row.kind === "reserve_runway_below");
  const losses = alerts.filter((row) => row.kind === "loss_budget_exceeded");
  const freshness = alerts.filter((row) => row.kind === "quote_stale");
  const spreads = alerts.filter((row) => row.kind === "spread_below");
  return <div className="space-y-4">
    <Card className={cn(summary.level === "critical" && "border-destructive/30", summary.level === "watch" && "border-amber-500/30")}>
      <CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><RiShieldCheckLine className="text-primary" /> سلامت وام</CardTitle><p className="mt-1 type-caption leading-6 text-muted-foreground">این وضعیت از تعهد بازپرداخت، ذخیره و بودجه زیان تعریف شده توسط خودت ساخته می شود.</p></div><HealthBadge level={summary.level}/></div></CardHeader>
      <CardContent className="space-y-4"><div className="rounded-2xl border bg-muted/20 p-4"><div className="type-strong">{summary.headline}</div><p className="mt-1 type-caption leading-6 text-muted-foreground">{summary.detail}</p></div><div className="grid gap-3 sm:grid-cols-3"><Metric label="مرزهای عبورکرده" value={summary.triggeredCount}/><Metric label="نزدیک به مرز" value={summary.watchCount}/><Metric label={"\u067e\u0627\u06cc\u0634 \u0646\u0627\u0642\u0635"} value={summary.unavailableCount}/></div></CardContent>
    </Card>

    {reserve && <RiskAlertRow alert={reserve} view={view} risk={risk} icon={<RiAlarmWarningLine />} />}
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><RiStockLine className="text-primary" /> بودجه زیان دارایی های متصل</CardTitle></CardHeader><CardContent className="space-y-3">
      {losses.length ? losses.map((alert) => <RiskAlertRow key={alert.id ?? `${alert.loanId}-${alert.assetId}`} alert={alert} view={view} risk={risk} compact />) : <div className="rounded-2xl border border-dashed p-5 text-center"><div className="type-strong">هنوز موقعیت قابل پایشی وجود ندارد</div><p className="mt-1 type-caption leading-6 text-muted-foreground">وقتی خریدی را به این وام متصل کنی و بودجه زیان روشن باشد، برای هر دارایی یک مرز مستقل ساخته می شود.</p></div>}
    </CardContent></Card>

    {freshness.length ? <Card><CardHeader><CardTitle>{"\u062a\u0627\u0632\u06af\u06cc \u0642\u06cc\u0645\u062a \u0628\u0627\u0632\u0627\u0631"}</CardTitle></CardHeader><CardContent className="space-y-3">{freshness.map((alert) => <RiskAlertRow key={alert.id ?? `fresh-${alert.assetId}`} alert={alert} view={view} risk={risk} compact />)}</CardContent></Card> : null}

    {spreads.length ? <Card><CardHeader><CardTitle>{"\u0628\u0627\u0632\u062f\u0647 \u0635\u0646\u062f\u0648\u0642 \u062f\u0631 \u0628\u0631\u0627\u0628\u0631 \u0647\u0632\u06cc\u0646\u0647 \u0648\u0627\u0645"}</CardTitle><p className="mt-1 type-caption leading-6 text-muted-foreground">{"\u0641\u0642\u0637 \u0628\u0627\u0632\u062f\u0647 \u0633\u0627\u0644\u0627\u0646\u0647\u200c\u0634\u062f\u0647 \u062b\u0628\u062a\u200c\u0634\u062f\u0647 \u06a9\u0627\u0631\u0628\u0631 \u0628\u0627 \u062d\u062f\u0627\u0642\u0644 \u06f9\u06f0 \u0631\u0648\u0632 \u0633\u0627\u0628\u0642\u0647 \u0645\u0642\u0627\u06cc\u0633\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f\u061b \u0627\u06cc\u0646 \u0639\u062f\u062f \u067e\u06cc\u0634\u200c\u0628\u06cc\u0646\u06cc \u0628\u0627\u0632\u062f\u0647 \u0622\u06cc\u0646\u062f\u0647 \u0646\u06cc\u0633\u062a."}</p></CardHeader><CardContent className="space-y-3">{spreads.map((alert) => <RiskAlertRow key={alert.id ?? `spread-${alert.assetId}`} alert={alert} view={view} risk={risk} compact />)}</CardContent></Card> : null}

    <div className="rounded-2xl border bg-muted/20 p-4 type-caption leading-6 text-muted-foreground"><strong className="text-foreground">ضد اسپم:</strong> بعد از عبور از مرز، همان هشدار تا برگشت معنی دار به محدوده امن دوباره اجرا نمی شود. ذخیره مثلا بعد از برگشت از زیر ۳ قسط به ۴ قسط دوباره آماده می شود؛ زیان هم بعد از کاهش به حدود ۸۰٪ بودجه دوباره مسلح می شود.</div>
  </div>;
}

function RiskAlertRow({ alert, view, risk, icon, compact = false }: { alert: LoanRiskAlert; view: LoanView; risk: LoanRiskControls; icon?: React.ReactNode; compact?: boolean }) {
  const observation = observeLoanRisk(alert, view);
  const position = alert.assetId ? view.positions.find((row) => row.asset.id === alert.assetId) : undefined;
  const label = alert.kind === "reserve_runway_below" ? "ذخیره بازپرداخت" : position?.asset.name ?? "دارایی متصل";
  const status = !alert.enabled ? "خاموش" : !observation.available ? "داده کافی نیست" : observation.conditionMet ? "مرز عبور کرده" : !alert.armed ? "در انتظار بازآماده سازی" : "در محدوده";
  return <div className={cn("rounded-2xl border p-4", observation.conditionMet && alert.enabled && "border-destructive/25 bg-destructive/[.035]", compact && "p-3")}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-2">{icon && <span className="mt-0.5 text-primary [&_svg]:size-5">{icon}</span>}<div className="min-w-0"><div className="type-strong">{label}</div><p className="mt-1 type-caption leading-6 text-muted-foreground">{observation.detail}</p></div></div><Badge className={cn(observation.conditionMet && alert.enabled && "text-destructive", !observation.available && "text-muted-foreground")}>{status}</Badge></div>
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3"><Button size="sm" variant={alert.enabled ? "outline" : "default"} onClick={() => alert.id && void risk.setEnabled(alert.id, !alert.enabled)}>{alert.enabled ? "خاموش کردن پایش" : "فعال کردن پایش"}</Button><Button size="sm" variant="ghost" onClick={() => alert.id && void risk.setNotify(alert.id, !alert.notifyBrowser)}><RiNotification3Line /> {alert.notifyBrowser ? "اعلان سیستم روشن" : "اعلان سیستم خاموش"}</Button><span className="type-caption text-muted-foreground">{alert.armed ? "آماده هشدار" : "تا برگشت به محدوده امن دوباره هشدار نمی دهد"}</span>{alert.lastTriggeredAt ? <span className="type-caption text-muted-foreground">{"\u0622\u062e\u0631\u06cc\u0646 \u0647\u0634\u062f\u0627\u0631: "}{new Date(alert.lastTriggeredAt).toLocaleString("fa-IR")}</span> : null}</div>
  </div>;
}

function HealthBadge({ level }: { level: "healthy" | "watch" | "critical" }) {
  if (level === "critical") return <Badge className="border-destructive/25 bg-destructive/8 text-destructive">نیازمند اقدام</Badge>;
  if (level === "watch") return <Badge className="border-amber-500/25 bg-amber-500/8">احتیاط</Badge>;
  return <Badge className="border-primary/20 bg-primary/8 text-primary">در محدوده برنامه</Badge>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border bg-background/70 p-3"><div className="type-caption text-muted-foreground">{label}</div><div className="mt-1 type-card-title">{value.toLocaleString("fa-IR")}</div></div>;
}
