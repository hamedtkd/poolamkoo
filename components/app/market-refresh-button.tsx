"use client";

import { RiRefreshLine } from "react-icons/ri";
import { useAppRuntime } from "@/components/app/app-runtime";
import { cn } from "@/lib/utils";

export function MarketRefreshButton({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { market } = useAppRuntime();
  const title = market.lastUpdated
    ? `به‌روزرسانی قیمت‌ها - ${new Intl.DateTimeFormat("fa-IR-u-ca-persian", { hour: "2-digit", minute: "2-digit" }).format(new Date(market.lastUpdated))}`
    : "دریافت قیمت‌های بازار";
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={market.loading}
      onClick={() => void market.refresh()}
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-xl border bg-background/70 px-3 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50",
        !showLabel && "w-10 px-0",
        className,
      )}
    >
      <RiRefreshLine className={cn("size-4", market.loading && "animate-spin")} />
      {showLabel && <span>{market.loading ? "در حال دریافت..." : "به‌روزرسانی بازار"}</span>}
    </button>
  );
}
