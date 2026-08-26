"use client";

import { useId } from "react";

interface AllocationSegment {
  label: string;
  value: number;
  color?: string;
}

export function AllocationDonut({
  segments,
  size = 210,
  stroke = 26,
}: {
  segments: AllocationSegment[];
  size?: number;
  stroke?: number;
}) {
  const id = useId();
  const radius = (size - stroke) / 2;
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  const hasData = total > 0.01;
  const circumference = 2 * Math.PI * radius;
  const gap = 5;
  const colors = ["var(--chart-3)", "var(--chart-2)", "var(--chart-1)"];
  const renderedSegments = segments.map((segment, index) => {
    const offset = segments
      .slice(0, index)
      .reduce((sum, current) => sum + circumference * (current.value / 100), 0);
    const length = Math.max(0, circumference * (segment.value / 100) - gap);
    return {
      ...segment,
      stroke: segment.color || colors[index % colors.length],
      dash: `${length} ${circumference - length}`,
      dashOffset: -offset,
    };
  });

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible" aria-hidden="true">
        <defs>
          <filter id={id}><feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity=".08" /></filter>
        </defs>
        {hasData && renderedSegments.map((segment) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={segment.dash}
            strokeDashoffset={segment.dashOffset}
            filter={`url(#${id})`}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="type-page-title">{hasData ? "۱۰۰٪" : "—"}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">{hasData ? "تقسیم ثبت‌شده" : "بدون داده"}</div>
        </div>
      </div>
    </div>
  );
}
