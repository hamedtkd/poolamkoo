"use client";

import { RiCloudLine, RiInformationLine, RiNotification3Line, RiRefreshLine, RiShieldCheckLine } from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BackgroundPushControls } from "@/hooks/use-background-push";
import { cn } from "@/lib/utils";

const labels: Record<BackgroundPushControls["status"], string> = {
  checking: "در حال بررسی",
  unsupported: "پشتیبانی نمی‌شود",
  unconfigured: "نیازمند تنظیم سرور",
  disabled: "خاموش",
  enabled: "فعال",
  denied: "مجوز مسدود است",
  error: "خطای اتصال",
};

export function MarketPushStatus({ push }: { push: BackgroundPushControls }) {
  const enabled = push.status === "enabled";
  return <div className={cn("rounded-2xl border p-4", enabled && "border-primary/25 bg-primary/5") }>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><RiCloudLine className="text-primary" /><span className="type-strong">هشدار وقتی PWA بسته است</span><Badge className={enabled ? "text-primary" : "text-muted-foreground"}>{labels[push.status]}</Badge></div>
        <p className="mt-1 type-caption text-muted-foreground">با Web Push، شرط‌های دارای «اعلان مرورگر» روی سرور سبک بررسی می‌شوند و برای دریافت هشدار لازم نیست پولم‌کو باز باشد.</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {enabled ? <Button variant="outline" onClick={() => void push.disable()}>خاموش‌کردن Push</Button> : <Button onClick={() => void push.enable()} disabled={push.status === "checking" || push.status === "unsupported" || push.status === "unconfigured" || push.status === "denied"}><RiNotification3Line /> فعال‌سازی Push</Button>}
        {push.status === "error" && <Button size="icon" variant="outline" title="تلاش دوباره" onClick={() => void push.refresh()}><RiRefreshLine /></Button>}
      </div>
    </div>
    <div className="mt-3 grid gap-2 text-[10px] leading-5 text-muted-foreground sm:grid-cols-2">
      <div className="flex gap-2 rounded-xl bg-background/60 p-2.5"><RiShieldCheckLine className="mt-0.5 shrink-0 text-primary" /><span>فقط نماد، شرط هشدار و Push Subscription روی سرور ذخیره می‌شود؛ موجودی سبد، مبلغ خرید و سایر داده‌های مالی ارسال نمی‌شوند.</span></div>
      <div className="flex gap-2 rounded-xl bg-background/60 p-2.5"><RiInformationLine className="mt-0.5 shrink-0 text-primary" /><span>{enabled ? `${new Intl.NumberFormat("fa-IR").format(push.remoteAlertCount)} هشدار فعال برای Push همگام است. بررسی سرور طبق Cron انجام می‌شود.` : "Push اختیاری است؛ هشدارهای محلی v0.12 بدون آن همچنان هنگام باز بودن اپ کار می‌کنند."}</span></div>
    </div>
    {push.message && <p className="mt-3 rounded-xl bg-muted/45 px-3 py-2 text-xs text-muted-foreground">{push.message}</p>}
  </div>;
}
