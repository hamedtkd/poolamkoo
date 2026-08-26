"use client";

import dynamic from "next/dynamic";
import type { MoneyUnit } from "@/lib/types";

const DeferredPortfolioAreaChart = dynamic(
  () => import("@/components/charts/portfolio-area-chart").then((mod) => mod.PortfolioAreaChart),
  { ssr: false, loading: () => <ChartPlaceholder height="h-[245px]" /> },
);

export function LazyPortfolioAreaChart({ data, unit = "toman" }: { data: Array<{ date: string; value: number }>; unit?: MoneyUnit }) {
  return <DeferredPortfolioAreaChart data={data} unit={unit} />;
}

function ChartPlaceholder({ height }: { height: string }) {
  return <div className={`${height} w-full animate-pulse rounded-2xl bg-muted/35 motion-reduce:animate-none`} aria-label="در حال آماده‌سازی نمودار" />;
}
