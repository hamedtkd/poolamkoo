"use client";

import { RiFileCopyLine, RiPulseLine, RiRefreshLine, RiShieldCheckLine } from "react-icons/ri";
import { useAppRuntime } from "@/components/app/app-runtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
  formatMarketDiagnostics,
  MARKET_PROVIDER_ORDER,
  marketCoverageLabel,
  marketProviderActivityLabel,
  marketProviderMeta,
  marketProviderStatusLabel,
  marketRuntimeStatus,
  marketSnapshotCoverageDetail,
} from "@/lib/market/status";
import { marketLaunchGuardrails } from "@/lib/market/quota";
import { cn } from "@/lib/utils";

export function MarketStatusCard() {
  const { market } = useAppRuntime();
  const runtime = marketRuntimeStatus(market.mode, market.health, market.coverage);
  const updated = formatUpdatedAt(market.lastUpdated);
  const snapshotDetail = marketSnapshotCoverageDetail(market.coverage);

  async function copyDiagnostics() {
    try {
      await navigator.clipboard.writeText(formatMarketDiagnostics({
        mode: market.mode,
        health: market.health,
        coverage: market.coverage,
        lastUpdated: market.lastUpdated,
      }));
      toast({
        tone: "success",
        title: "وضعیت بازار کپی شد",
        description: "این متن هیچ قیمت، نماد، نام دارایی، شناسه بازار یا کلید Provider ندارد.",
      });
    } catch {
      toast({ tone: "error", title: "کپی انجام نشد", description: "اجازه Clipboard مرورگر را بررسی کن و دوباره تلاش کن." });
    }
  }

  return <Card>
    <CardHeader>
      <div className="flex items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2"><RiPulseLine className="text-primary" /> وضعیت بازار</CardTitle>
        <Badge className={cn((market.health?.degraded || market.coverage.snapshot > 0) && "border-amber-500/35 bg-amber-500/10")}>{runtime.label}</Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-2xl border bg-background/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="type-strong">{runtime.label}</div>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{runtime.detail}</p>
          </div>
          <Button type="button" size="sm" disabled={market.loading} onClick={() => void market.refresh()}>
            <RiRefreshLine className={cn(market.loading && "animate-spin")} /> {market.loading ? "در حال بررسی..." : "بررسی دوباره بازار"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 type-caption text-muted-foreground">
          <span>{updated ? `آخرین داده: ${updated}` : "هنوز دریافت موفقی ثبت نشده"}</span>
          <span>پوشش: {marketCoverageLabel(market.coverage)}</span>
        </div>
        {snapshotDetail && <p className="mt-2 type-caption text-amber-700 dark:text-amber-300">{snapshotDetail}</p>}
        {market.warning && <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/7 p-3 text-xs leading-6 text-muted-foreground">{market.warning}</p>}
      </div>

      <details id="market-details" className="scroll-mt-28 rounded-2xl border bg-muted/15 open:bg-muted/20">
        <summary className="cursor-pointer list-none px-4 py-3 type-strong marker:hidden">
          <div className="flex items-center justify-between gap-3">
            <span>جزئیات فنی Providerها و سهمیه</span>
            <span className="type-caption font-normal text-muted-foreground">برای عیب‌یابی باز کن</span>
          </div>
        </summary>
        <div className="space-y-4 border-t p-4">
          <div className="space-y-2" aria-label="وضعیت Providerهای بازار">
            {MARKET_PROVIDER_ORDER.map((provider) => {
              const meta = marketProviderMeta(provider);
              const health = market.health?.providers[provider];
              return <div key={provider} className="rounded-2xl bg-background/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="type-strong">{meta.name} · {meta.role}</div><div className="mt-0.5 type-caption text-muted-foreground">{meta.description}</div></div>
                  <Badge className={cn("shrink-0", health?.status === "unavailable" && "border-destructive/35 bg-destructive/8", health?.status === "degraded" && "border-amber-500/35 bg-amber-500/10")}>{marketProviderStatusLabel(health)}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{marketProviderActivityLabel(health)}</p>
              </div>;
            })}
          </div>

          <div className="rounded-xl border bg-background/70 p-3 text-xs leading-6 text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 type-strong text-foreground"><RiShieldCheckLine className="text-primary" /> مرز داده</div>
            وضعیت بالا فقط سلامت مسیرها، تعداد پاسخ‌ها و زمان تقریبی را نشان می‌دهد. Diagnostic شامل قیمت، نماد، نام دارایی، شناسه بازار، مبلغ مالی یا Secretهای Provider نیست.
          </div>

          <div className="rounded-xl border bg-background/70 p-3 text-xs leading-6 text-muted-foreground">
            <div className="mb-1 type-strong text-foreground">محافظت Launch و سهمیه</div>
            <ul className="space-y-1">{marketLaunchGuardrails().map((item) => <li key={item}>• {item}</li>)}</ul>
            <p className="mt-2">این Guardrailها مصرف Upstream را کم می‌کنند؛ Cooldown حافظه‌ای best-effort است و جایگزین سقف رسمی Provider یا مانیتورینگ Hosting نیست.</p>
          </div>

          <Button type="button" variant="outline" onClick={() => void copyDiagnostics()}><RiFileCopyLine /> کپی Diagnostic امن</Button>
          <p className="type-caption leading-5 text-muted-foreground">ترتیب fallback تغییر نکرده است: Provider واقعی → Snapshot واقعی ذخیره‌شده → قیمت دستی کاربر → وضعیت ناموجود.</p>
        </div>
      </details>
    </CardContent>
  </Card>;
}

function formatUpdatedAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
