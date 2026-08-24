"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketCandle, MarketHistoryRange, MarketSnapshot, MarketSource } from "@/lib/types";

type RemoteHistoryResponse = {
  mode?: string;
  candles?: MarketCandle[];
  source?: MarketSource;
  warning?: string;
  range?: MarketHistoryRange;
};

type HistoryState = {
  key: string;
  candles: MarketCandle[];
  source: MarketSource;
  warning?: string;
};

const memoryCache = new Map<string, HistoryState>();
const inFlight = new Map<string, Promise<HistoryState>>();

function snapshotsToCandles(rows: MarketSnapshot[]): MarketCandle[] {
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

function remoteSupported(symbol: string, marketId?: string) {
  return Boolean(marketId || symbol === "USD" || symbol === "IR_GOLD_18K");
}

async function requestHistory(key: string, symbol: string, marketId: string | undefined, range: MarketHistoryRange) {
  const existing = inFlight.get(key);
  if (existing) return existing;
  const params = new URLSearchParams({ symbol, range });
  if (marketId) params.set("marketId", marketId);
  const promise = fetch(`/api/market/history?${params}`)
    .then(async (response) => {
      const payload = await response.json().catch(() => ({})) as RemoteHistoryResponse;
      const state: HistoryState = {
        key,
        candles: Array.isArray(payload.candles) ? payload.candles : [],
        source: payload.source === "tindex" ? "tindex" : "local",
        warning: payload.warning,
      };
      memoryCache.set(key, state);
      return state;
    })
    .catch((error: unknown) => {
      const state: HistoryState = {
        key, candles: [], source: "local",
        warning: error instanceof Error ? error.message : "دریافت تاریخچه بازار ناموفق بود.",
      };
      memoryCache.set(key, state);
      return state;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export function useMarketHistory({ symbol, marketId, snapshots, range }: {
  symbol: string;
  marketId?: string;
  snapshots: MarketSnapshot[];
  range: MarketHistoryRange;
}) {
  const localCandles = useMemo(
    () => snapshotsToCandles(snapshots.filter((row) => row.symbol === symbol)),
    [snapshots, symbol],
  );
  const supported = remoteSupported(symbol, marketId);
  const key = `${symbol}:${marketId ?? "core"}:${range}`;
  const [remote, setRemote] = useState<HistoryState>({ key: "", candles: [], source: "local" });

  useEffect(() => {
    if (!supported) return;
    let active = true;
    const cached = memoryCache.get(key);
    if (cached) {
      void Promise.resolve(cached).then((state) => { if (active) setRemote(state); });
    } else {
      void requestHistory(key, symbol, marketId, range).then((state) => {
        if (active) setRemote(state);
      });
    }
    return () => { active = false; };
  }, [key, marketId, range, supported, symbol]);

  const activeRemote = remote.key === key ? remote : undefined;
  if (activeRemote?.candles.length && activeRemote.candles.length >= 2) {
    return { candles: activeRemote.candles, mode: "remote" as const, source: "tindex" as const, loading: false, warning: activeRemote.warning };
  }

  const days = range === "1m" ? 30 : 90;
  const local = localCandles.slice(-days);
  if (local.length >= 2) {
    return {
      candles: local,
      mode: "local" as const,
      source: "local" as const,
      loading: supported && !activeRemote,
      warning: activeRemote?.warning,
    };
  }

  return {
    candles: [] as MarketCandle[],
    mode: "unavailable" as const,
    source: "local" as const,
    loading: supported && !activeRemote,
    warning: activeRemote?.warning,
  };
}
