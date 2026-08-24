"use client";

import { useId } from "react";
import { clamp } from "@/lib/utils";

interface ArcGaugeProps {
  value: number;
  label?: string;
  size?: number;
  stroke?: number;
  gapRatio?: number;
}

export function ArcGauge({ value, label = "تحقق هدف", size = 190, stroke = 24, gapRatio = 0 }: ArcGaugeProps) {
  const id = useId();
  const pct = clamp(value, 0, 100);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const safeGap = clamp(gapRatio, 0, 0.45);
  const usable = circumference * (1 - safeGap);
  const hiddenGap = circumference - usable;
  const progress = usable * (pct / 100);
  const trackDash = safeGap > 0 ? `${usable} ${hiddenGap}` : undefined;
  const progressDash = safeGap > 0
    ? `${progress} ${Math.max(0, usable - progress) + hiddenGap}`
    : `${progress} ${Math.max(0, circumference - progress)}`;

  const accessibleLabel = `${new Intl.NumberFormat("fa-IR").format(Math.round(pct))}٪ ${label}`;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={accessibleLabel} title={accessibleLabel}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in oklab, var(--primary) 10%, var(--muted))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={trackDash}
        />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={progressDash}
            style={{ transition: "stroke-dasharray 650ms cubic-bezier(.2,.8,.2,1)" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-4xl type-strong tabular-nums">{new Intl.NumberFormat("fa-IR").format(Math.round(pct))}٪</div>
          <div className="mt-1 type-caption text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
