"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import type { Asset, MarketAlert, MarketQuote, MarketSnapshot, MarketWatchItem } from "@/lib/types";

type MarketResponse = {
  mode?: string;
  quotes?: MarketQuote[];
  warning?: string;
  fetchedAt?: string;
};

let inFlight: { key: string; promise: Promise<MarketResponse> } | null = null;

function targetIds(assets: Asset[], watchlist: MarketWatchItem[], alerts: MarketAlert[]) {
  const assetIds = assets.filter((asset) => asset.marketSource === "tindex" && asset.marketId).map((asset) => asset.marketId as string);
  const watchIds = watchlist.filter((item) => item.source === "tindex" && item.marketId).map((item) => item.marketId);
  const alertIds = alerts.filter((item) => item.enabled && item.source === "tindex" && item.marketId).map((item) => item.marketId);
  return [...new Set([...assetIds, ...watchIds, ...alertIds])].sort();
}

async function requestMarket(ids: readonly string[]) {
  const key = ids.join(",");
  if (!inFlight || inFlight.key !== key) {
    const params = new URLSearchParams();
    for (const id of ids) params.append("tindex", id);
    const url = params.size ? `/api/market?${params}` : "/api/market";
    const promise = fetch(url, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok && !Array.isArray(data.quotes)) throw new Error(data.warning || "market request failed");
        return data as MarketResponse;
      })
      .finally(() => { if (inFlight?.promise === promise) inFlight = null; });
    inFlight = { key, promise };
  }
  return inFlight.promise;
}

async function latestCachedQuotes() {
  const rows = await db.marketSnapshots.orderBy("capturedAt").reverse().toArray();
  const latest = new Map<string, MarketSnapshot>();
  for (const row of rows) if (!latest.has(row.symbol)) latest.set(row.symbol, row);
  return [...latest.values()];
}

export function useMarket(assets: Asset[] = [], watchlist: MarketWatchItem[] = [], alerts: MarketAlert[] = []) {
  const idsKey = useMemo(() => JSON.stringify(targetIds(assets, watchlist, alerts)), [alerts, assets, watchlist]);
  const ids = useMemo(() => JSON.parse(idsKey) as string[], [idsKey]);
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | undefined>();

  const applyResponse = useCallback(async (data: MarketResponse) => {
    const rows = Array.isArray(data.quotes) ? data.quotes : [];
    setWarning(data.warning);
    if (!rows.length) {
      const cached = await latestCachedQuotes();
      setQuotes(cached);
      setMode(cached.length ? "offline" : (data.mode || "unavailable"));
      setLastUpdated(cached[0]?.capturedAt ?? data.fetchedAt ?? null);
      return;
    }

    const capturedAt = data.fetchedAt || new Date().toISOString();
    setQuotes(rows);
    setMode(data.mode || "live");
    setLastUpdated(capturedAt);
    await db.marketSnapshots.bulkAdd(rows.map((quote) => ({ ...quote, capturedAt })));
    const count = await db.marketSnapshots.count();
    if (count > 5000) {
      const oldIds = await db.marketSnapshots.orderBy("capturedAt").limit(count - 5000).primaryKeys();
      await db.marketSnapshots.bulkDelete(oldIds as number[]);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await applyResponse(await requestMarket(ids));
    } catch {
      const cached = await latestCachedQuotes();
      setQuotes(cached);
      setMode(cached.length ? "offline" : "unavailable");
      setLastUpdated(cached[0]?.capturedAt ?? null);
      setWarning("دریافت قیمت جدید ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [applyResponse, ids]);

  useEffect(() => {
    let active = true;
    void latestCachedQuotes().then(async (cached) => {
      if (!active) return;
      if (cached.length) {
        setQuotes(cached);
        setMode("offline");
        setLastUpdated(cached[0]?.capturedAt ?? null);
      }
      try {
        const data = await requestMarket(ids);
        if (active) await applyResponse(data);
      } catch {
        if (active) setWarning("دریافت قیمت جدید ناموفق بود.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [applyResponse, ids, idsKey]);

  return { quotes, loading, mode, lastUpdated, warning, refresh };
}
