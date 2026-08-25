"use client";

import Link from "next/link";
import { RiLineChartLine, RiShieldCheckLine } from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cloudflareAnalyticsStatus } from "@/lib/analytics";

export function AnalyticsSettingsCard() {
  const status = cloudflareAnalyticsStatus(process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN);
  const active = status === "enabled";
  const development = status === "development";

  return <Card>
    <CardHeader>
      <div className="flex items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2"><RiLineChartLine className="text-primary" /> آمار استفاده و کارایی</CardTitle>
        <Badge>{active ? "فعال" : development ? "فقط Production" : "غیرفعال"}</Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm leading-7 text-muted-foreground">
        {active ? "Cloudflare Web Analytics فقط آمار کلی بازدید و عملکرد صفحه‌ها را می‌سنجد." : development ? "توکن تنظیم شده، اما Beacon در محیط توسعه اجرا نمی‌شود تا داده محلی وارد آمار نشود." : "در این استقرار هیچ Beacon تحلیلی بار نمی‌شود. Self-host بدون تنظیم توکن کاملاً بدون Analytics می‌ماند."}
      </p>
      <div className="rounded-xl border bg-background/70 p-3 text-xs leading-6 text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 type-strong text-foreground"><RiShieldCheckLine className="text-primary" /> مرز داده</div>
        مبلغ، موجودی، نام دارایی شخصی، جست‌وجو، تراکنش و محتوای Backup به Analytics ارسال نمی‌شوند و پولم‌کو هیچ Custom Event مالی تعریف نمی‌کند.
      </div>
      <div className="flex flex-wrap gap-2 text-xs type-strong">
        <Link href="/analytics" className="rounded-lg border px-3 py-2 transition hover:bg-accent">جزئیات Analytics</Link>
        <Link href="/privacy" className="rounded-lg border px-3 py-2 transition hover:bg-accent">سیاست داده</Link>
      </div>
    </CardContent>
  </Card>;
}
