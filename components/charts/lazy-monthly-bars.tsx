"use client";

import dynamic from "next/dynamic";
import type { MoneyUnit } from "@/lib/types";

type Row = { month: string; life: number; safety: number; growth: number };

const DeferredMonthlyBars = dynamic(
  () => import("@/components/charts/monthly-bars").then((mod) => mod.MonthlyBars),
  { ssr: false, loading: () => <div className="h-[250px] w-full animate-pulse rounded-2xl bg-muted/35 motion-reduce:animate-none" aria-label="در حال آماده‌سازی نمودار" /> },
);

export function LazyMonthlyBars({ data, unit }: { data: Row[]; unit: MoneyUnit }) {
  return <DeferredMonthlyBars data={data} unit={unit} />;
}
