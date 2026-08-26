"use client";

import dynamic from "next/dynamic";
import type { MarketCandle } from "@/lib/types";

const DeferredFinancialChart = dynamic(
  () => import("@/components/charts/financial-chart").then((mod) => mod.FinancialChart),
  { ssr: false, loading: () => <div className="min-h-64 w-full animate-pulse rounded-2xl bg-muted/35 motion-reduce:animate-none" aria-label="در حال آماده‌سازی نمودار بازار" /> },
);

export function LazyFinancialChart({ candles, height = 330, variant = "candles" }: { candles: MarketCandle[]; height?: number; variant?: "candles" | "line" }) {
  return <DeferredFinancialChart candles={candles} height={height} variant={variant} />;
}
