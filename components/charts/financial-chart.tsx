"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineSeries,
  createChart,
  type CandlestickData,
  type LineData,
  type Time,
} from "lightweight-charts";
import type { MarketCandle } from "@/lib/types";

export type Candle = MarketCandle;

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function FinancialChart({ candles, height = 330, variant = "candles" }: {
  candles: Candle[];
  height?: number;
  variant?: "candles" | "line";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [themeRevision, setThemeRevision] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeRevision((value) => value + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-palette"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !candles.length) return;

    const colors = {
      background: token("--chart-canvas-bg", "#ffffff"),
      text: token("--chart-canvas-text", "#27272a"),
      grid: token("--chart-canvas-grid", "#e4e4e733"),
      border: token("--chart-canvas-border", "#e4e4e7"),
      up: token("--chart-canvas-up", "#9a6f0a"),
      down: token("--chart-canvas-down", "#ef4444"),
    };

    const chart = createChart(root, {
      width: root.clientWidth,
      height,
      layout: { background: { type: ColorType.Solid, color: colors.background }, textColor: colors.text, attributionLogo: false },
      grid: { vertLines: { color: colors.grid }, horzLines: { color: colors.grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: colors.border, scaleMargins: { top: 0.08, bottom: 0.12 } },
      timeScale: { borderColor: colors.border, timeVisible: false, secondsVisible: false },
      localization: { locale: "fa-IR" },
    });

    if (variant === "line") {
      const series = chart.addSeries(LineSeries, {
        color: colors.up,
        lineWidth: 3,
        priceLineVisible: true,
        lastValueVisible: true,
      });
      series.setData(candles.map((candle) => ({ time: candle.time as Time, value: candle.close })) as LineData<Time>[]);
    } else {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: colors.up,
        downColor: colors.down,
        borderVisible: false,
        wickUpColor: colors.up,
        wickDownColor: colors.down,
        priceLineVisible: true,
        lastValueVisible: true,
      });
      series.setData(candles.map((candle) => ({ ...candle, time: candle.time as Time })) as CandlestickData<Time>[]);
    }

    chart.timeScale().fitContent();
    const resize = new ResizeObserver(() => chart.applyOptions({ width: root.clientWidth }));
    resize.observe(root);
    return () => { resize.disconnect(); chart.remove(); };
  }, [candles, height, themeRevision, variant]);

  if (!candles.length) {
    return <div className="grid min-h-[280px] place-items-center rounded-xl border border-dashed type-body text-muted-foreground">هنوز داده کافی برای نمودار وجود ندارد.</div>;
  }

  return <div>
    <div ref={rootRef} className="w-full overflow-hidden rounded-xl" style={{ height }} />
    <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
      {variant === "candles" ? <>
        <LegendDot className="bg-[var(--chart-canvas-up)]" label="کندل صعودی" />
        <LegendDot className="bg-[var(--chart-canvas-down)]" label="کندل نزولی" />
      </> : <LegendDot className="bg-[var(--chart-canvas-up)]" label="قیمت پایانی روز" />}
      <span>Crosshair برای خواندن دقیق قیمت و زمان است.</span>
    </div>
  </div>;
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${className}`} />{label}</span>;
}
