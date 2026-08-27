"use client";

import { RiRefreshLine } from "react-icons/ri";
import type { MarketHealthSummary } from "@/lib/market/reliability";
import { cn } from "@/lib/utils";

export type MarketRefreshControls = {
  loading: boolean;
  lastUpdated: string | null;
  mode?: string;
  health?: MarketHealthSummary;
  warning?: string;
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
  const controls: MarketRefreshControls = market ?? { loading: false, lastUpdated: null, refresh: async () => undefined };
  const timestamp = controls.lastUpdated
    ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(controls.lastUpdated))
    : null;
  const stateText = controls.loading
    ? "در حال دریافت قیمت‌های بازار"
    : controls.mode === "offline"
      ? "نمایش آخرین قیمت ذخیره‌شده"
      : controls.health?.degraded
        ? "قیمت‌ها دریافت شد؛ بعضی منابع بازار مشکل دارند"
        : controls.mode === "live"
          ? "قیمت‌های بازار به‌روز هستند"
          : controls.mode === "unconfigured"
            ? "Provider بازار تنظیم نشده است"
            : market
              ? "داده تازه بازار در دسترس نیست"
              : "بازار هنوز آماده نشده است";
  const title = timestamp ? `${stateText} - ${timestamp}` : stateText;

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
      {showLabel && <span>{controls.loading ? "در حال دریافت..." : controls.health?.degraded ? "به‌روزرسانی ناقص" : market ? "به‌روزرسانی بازار" : "بازار در حال آماده‌سازی"}</span>}
    </button>
  );
}
