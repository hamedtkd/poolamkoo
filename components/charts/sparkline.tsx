"use client";

import { sparklinePoints } from "@/lib/sparkline";

export function Sparkline({ data, positive = true }: { data: number[]; positive?: boolean }) {
  const points = sparklinePoints(data);
  if (!points) return <div className="h-12 w-full" aria-hidden="true" />;
  const stroke = positive ? "var(--profit)" : "var(--loss)";
  return <svg viewBox="0 0 120 48" role="img" aria-label="روند کوتاه قیمت" className="h-12 w-full" preserveAspectRatio="none"><polyline points={points} fill="none" stroke={stroke} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
