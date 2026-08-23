"use client";

import { useId } from "react";
import { clamp } from "@/lib/utils";

export function ArcGauge({ value, label = "تحقق هدف", size = 190, stroke = 24 }: { value: number; label?: string; size?: number; stroke?: number }) {
  const id = useId();
  const pct = clamp(value, 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = 0.18;
  const usable = c * (1 - gap);
  const progress = usable * (pct / 100);
  const rest = usable - progress;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 overflow-visible">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="color-mix(in oklab, var(--primary) 10%, var(--muted))" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${usable} ${c - usable}`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${progress} ${rest + c - usable}`} style={{ transition: "stroke-dasharray 650ms cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><div className="text-4xl font-black tabular-nums">{new Intl.NumberFormat("fa-IR").format(Math.round(pct))}٪</div><div className="mt-1 text-xs text-muted-foreground">{label}</div></div>
      </div>
    </div>
  );
}
