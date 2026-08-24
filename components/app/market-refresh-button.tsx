"use client";

import { RiRefreshLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

export type MarketRefreshControls = {
  loading: boolean;
  lastUpdated: string | null;
  refresh: () => void | Promise<void>;
};

export function MarketRefreshButton({
  market,
  className,
  showLabel = false,
  dataTour,
}: {
  market?: MarketRefreshControls | null;
  className?: string;
  showLabel?: boolean;
  dataTour?: string;
}) {
  const controls = market ?? { loading: false, lastUpdated: null, refresh: async () => undefined };
  const title = controls.lastUpdated
    ? `به‌روزرسانی قیمت‌ها - ${new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(controls.lastUpdated))}`
    : market ? "دریافت قیمت‌های بازار" : "بازار هنوز آماده نشده است";

  return (
    <button
      type="button"
      data-tour={dataTour}
      title={title}
      aria-label={title}
      disabled={!market || controls.loading}
      onClick={() => void controls.refresh()}
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-xl border bg-background/78 px-3 type-label text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-wait disabled:opacity-55",
        !showLabel && "w-10 px-0",
        className,
      )}
    >
      <RiRefreshLine className={cn("size-4 shrink-0", controls.loading && "animate-spin")} />
      {showLabel && <span>{controls.loading ? "در حال دریافت..." : market ? "به‌روزرسانی بازار" : "بازار در حال آماده‌سازی"}</span>}
    </button>
  );
}
