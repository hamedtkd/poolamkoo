"use client";

import { useMemo } from "react";
import type { Candle } from "@/components/charts/financial-chart";
import type { MarketSnapshot } from "@/lib/types";

export function useMarketHistory(symbol: string, snapshots: MarketSnapshot[]) {
  const candles = useMemo(
    () => snapshotsToCandles(snapshots.filter((row) => row.symbol === symbol)),
    [snapshots, symbol],
  );
  return candles.length >= 2
    ? { candles, mode: "local" as const }
    : { candles: [] as Candle[], mode: "unavailable" as const };
}

function snapshotsToCandles(rows: MarketSnapshot[]): Candle[] {
  const groups = new Map<string, MarketSnapshot[]>();
  for (const row of [...rows].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt))) {
    const day = row.capturedAt.slice(0, 10);
    groups.set(day, [...(groups.get(day) ?? []), row]);
  }
  return [...groups.entries()].map(([time, list]) => {
    const prices = list.map((row) => row.priceToman).filter((value) => Number.isFinite(value) && value > 0);
    return { time, open: prices[0] ?? 0, high: Math.max(...prices), low: Math.min(...prices), close: prices.at(-1) ?? 0 };
  }).filter((row) => row.close > 0).slice(-90);
}
