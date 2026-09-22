"use client";

import { RiAlarmWarningLine, RiCloudLine, RiNotification3Line, RiShieldCheckLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BackgroundPushControls } from "@/hooks/use-background-push";
import type { LoanReminderControls } from "@/hooks/use-loan-reminders";
import { loanReminderLeadText } from "@/lib/loans/reminders";
import { toPersianDate } from "@/lib/format";
import type { Loan } from "@/lib/types";
import { cn } from "@/lib/utils";

const pushLabels: Record<BackgroundPushControls["status"], string> = {
  checking: "در حال بررسی",
  unsupported: "پشتیبانی نمی‌شود",
  unconfigured: "سرور تنظیم نشده",
  disabled: "خاموش",
  enabled: "فعال",
  denied: "مجوز مسدود است",
  error: "خطای اتصال",
};

export function LoanReminderCard({ loan, reminders, backgroundPush }: {
  loan: Loan;
  reminders: LoanReminderControls;
  backgroundPush: BackgroundPushControls;
}) {
  const current = reminders.forLoan(loan.id);
  const permissionReady = reminders.permission === "granted";
  const needsPermission = loan.notifyBrowser && reminders.permission === "default";
  return <Card className={cn(current?.urgency === "overdue" && "border-destructive/30")}>
    <CardHeader><CardTitle className="flex items-center gap-2"><RiAlarmWarningLine className="text-primary" /> یادآوری بازپرداخت</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className={cn("rounded-2xl border p-4", current?.urgency === "overdue" && "border-destructive/25 bg-destructive/[.045]") }>
        {current ? <><div className="flex flex-wrap items-center justify-between gap-2"><div className="type-strong">قسط {current.installmentNo.toLocaleString("fa-IR")}</div><Badge className={current.urgency === "overdue" ? "text-destructive" : "text-primary"}>{loanReminderLeadText(current)}</Badge></div><p className="mt-2 type-caption text-muted-foreground">سررسید {toPersianDate(current.dueAt)}. ثبت پرداخت، یادآور همین قسط را خودکار از چرخه خارج می‌کند.</p></> : <><div className="type-strong">یادآور فعالی برای امروز نیست</div><p className="mt-1 type-caption text-muted-foreground">پولم‌کو در روزهای انتخاب‌شده و برای قسط عقب‌افتاده دوباره وضعیت را بررسی می‌کند.</p></>}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <StatusRow icon={<RiNotification3Line />} title="اعلان روی همین دستگاه" badge={permissionLabel(reminders.permission)}>
          {loan.notifyBrowser ? "ترجیح اعلان برای این وام روشن است. اعلان سیستم فقط بعد از اجازه صریح مرورگر نمایش داده می‌شود." : "اعلان مرورگر برای این وام خاموش است؛ یادآور داخل اپ همچنان نمایش داده می‌شود."}
          {needsPermission && <Button className="mt-3" size="sm" onClick={() => void reminders.requestPermission()}>اجازه اعلان</Button>}
          {loan.notifyBrowser && reminders.permission === "denied" && <p className="mt-2 text-destructive">مجوز اعلان در مرورگر مسدود است و باید از تنظیمات سایت تغییر کند.</p>}
        </StatusRow>
        <StatusRow icon={<RiCloudLine />} title="وقتی PWA بسته است" badge={backgroundPush.featureEnabled ? pushLabels[backgroundPush.status] : "اختیاری"}>
          {backgroundPush.featureEnabled ? "Push پس‌زمینه می‌تواند یادآور سررسید را بدون باز بودن برنامه ارسال کند." : "یادآوری محلی فعال است. Push پس‌زمینه در نصب معمولی پولم‌کو عمداً خاموش می‌ماند و برای آن سرور زمان‌بندی لازم است."}
          {backgroundPush.featureEnabled && backgroundPush.status !== "enabled" && <Button className="mt-3" size="sm" variant="outline" onClick={() => void backgroundPush.enable()} disabled={["checking","unsupported","unconfigured","denied"].includes(backgroundPush.status)}>فعال‌سازی Push</Button>}
        </StatusRow>
      </div>

      <div className="flex gap-2 rounded-xl bg-muted/40 p-3 type-caption leading-6 text-muted-foreground"><RiShieldCheckLine className="mt-0.5 shrink-0 text-primary" /><span>{backgroundPush.status === "enabled" ? "برای یادآور وام، سرور فقط شناسه محلی وام، شماره قسط، تاریخ سررسید، روزهای یادآوری و منطقه زمانی را می‌گیرد. نام وام، مبلغ قسط، اصل وام و دارایی‌ها ارسال نمی‌شوند." : "تا وقتی Push پس‌زمینه فعال نشده، زمان‌بندی و اطلاعات وام از دستگاه خارج نمی‌شوند."}</span></div>
      {backgroundPush.message && <p className="rounded-xl bg-muted/45 px-3 py-2 type-caption text-muted-foreground">{backgroundPush.message}</p>}
      {permissionReady && loan.notifyBrowser && <div className="type-caption text-muted-foreground">اعلان محلی این دستگاه آماده است.</div>}
    </CardContent>
  </Card>;
}

function StatusRow({ icon, title, badge, children }: { icon: React.ReactNode; title: string; badge: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 type-strong">{icon}{title}</div><Badge>{badge}</Badge></div><div className="mt-2 type-caption leading-6 text-muted-foreground">{children}</div></div>;
}

function permissionLabel(permission: LoanReminderControls["permission"]) {
  if (permission === "granted") return "مجاز";
  if (permission === "denied") return "مسدود";
  if (permission === "unsupported") return "پشتیبانی نمی‌شود";
  return "در انتظار اجازه";
}
