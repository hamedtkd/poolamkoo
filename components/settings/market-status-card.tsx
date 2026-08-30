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
      <div className="rounded-2xl border bg-background/70 p-3">
        <div className="type-strong">آخرین refresh</div>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">{runtime.detail}</p>
        <p className="mt-1 type-caption text-muted-foreground">{updated ? `آخرین داده: ${updated}` : "هنوز زمان دریافت موفقی ثبت نشده است."}</p>
        <p className="mt-1 type-caption text-muted-foreground">پوشش فعلی: {marketCoverageLabel(market.coverage)}</p>
        {snapshotDetail && <p className="mt-1 type-caption text-amber-700 dark:text-amber-300">{snapshotDetail}</p>}
      </div>

      <div className="space-y-2" aria-label="وضعیت Providerهای بازار">
        {MARKET_PROVIDER_ORDER.map((provider) => {
          const meta = marketProviderMeta(provider);
          const health = market.health?.providers[provider];
          return <div key={provider} className="rounded-2xl bg-muted/35 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="type-strong">{meta.name} · {meta.role}</div><div className="mt-0.5 type-caption text-muted-foreground">{meta.description}</div></div>
              <Badge className={cn("shrink-0", health?.status === "unavailable" && "border-destructive/35 bg-destructive/8", health?.status === "degraded" && "border-amber-500/35 bg-amber-500/10")}>{marketProviderStatusLabel(health)}</Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{marketProviderActivityLabel(health)}</p>
          </div>;
        })}
      </div>

      {market.warning && <p className="rounded-xl border border-amber-500/25 bg-amber-500/7 p-3 text-xs leading-6 text-muted-foreground">{market.warning}</p>}

      <div className="rounded-xl border bg-background/70 p-3 text-xs leading-6 text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 type-strong text-foreground"><RiShieldCheckLine className="text-primary" /> مرز داده</div>
        وضعیت بالا فقط سلامت مسیرها، تعداد پاسخ‌ها و زمان تقریبی را نشان می‌دهد. متن Diagnostic شامل قیمت، نماد، نام دارایی، شناسه بازار، مبلغ مالی یا Secretهای Provider نیست.
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" disabled={market.loading} onClick={() => void market.refresh()}><RiRefreshLine className={cn(market.loading && "animate-spin")} /> {market.loading ? "در حال refresh..." : "بررسی دوباره بازار"}</Button>
        <Button type="button" variant="outline" onClick={() => void copyDiagnostics()}><RiFileCopyLine /> کپی Diagnostic امن</Button>
      </div>
      <p className="type-caption leading-5 text-muted-foreground">ترتیب fallback تغییر نکرده است: Provider واقعی → Snapshot واقعی ذخیره‌شده → قیمت دستی کاربر → وضعیت ناموجود.</p>
    </CardContent>
  </Card>;
}

function formatUpdatedAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
