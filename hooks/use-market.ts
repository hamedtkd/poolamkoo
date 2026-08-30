"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import type { MarketHealthSummary } from "@/lib/market/reliability";
import {
  marketQuoteForStorage,
  mergeRuntimeMarketQuotes,
  type MarketCoverage,
} from "@/lib/market/runtime";
import type { Asset, ExchangeMarketSource, MarketAlert, MarketQuote, MarketSnapshot, MarketWatchItem } from "@/lib/types";

type MarketResponse = {
  mode?: string;
  quotes?: MarketQuote[];
  health?: MarketHealthSummary;
  warning?: string;
  fetchedAt?: string;
};

type MarketTarget = {
  source: ExchangeMarketSource;
  id: string;
  symbol: string;
  name: string;
};

const EMPTY_COVERAGE: MarketCoverage = { live: 0, snapshot: 0, total: 0 };
let inFlight: { key: string; promise: Promise<MarketResponse> } | null = null;

function targetDescriptors(assets: Asset[], watchlist: MarketWatchItem[], alerts: MarketAlert[]) {
  const targets: MarketTarget[] = [];
  for (const asset of assets) {
    if (asset.marketSource && asset.marketId && asset.symbol) {
      targets.push({ source: asset.marketSource, id: asset.marketId, symbol: asset.symbol, name: asset.name });
    }
  }
  for (const item of watchlist) {
    if (item.marketId) targets.push({ source: item.source, id: item.marketId, symbol: item.symbol, name: item.name });
  }
  for (const item of alerts) {
    if (item.enabled && item.marketId) targets.push({ source: item.source, id: item.marketId, symbol: item.symbol, name: item.name });
  }
  const unique = new Map<string, MarketTarget>();
  for (const target of targets) {
    const key = `${target.source}:${target.id}`;
    if (!unique.has(key)) unique.set(key, target);
  }
  return [...unique.values()].sort((a, b) => `${a.source}:${a.id}`.localeCompare(`${b.source}:${b.id}`));
}

function normalizeExchangeQuotes(quotes: MarketQuote[], targets: readonly MarketTarget[]) {
  const lookup = new Map(targets.map((target) => [`${target.source}:${target.id}`, target]));
  return quotes.map((quote) => {
    if (!quote.marketId || (quote.source !== "tsetmc" && quote.source !== "tindex")) return quote;
    const target = lookup.get(`${quote.source}:${quote.marketId}`);
    return target ? { ...quote, symbol: target.symbol, name: target.name } : quote;
  });
}

async function requestMarket(targets: readonly MarketTarget[]) {
  const key = targets.map((target) => `${target.source}:${target.id}`).join(",");
  if (!inFlight || inFlight.key !== key) {
    const params = new URLSearchParams();
    for (const target of targets) params.append(target.source, target.id);
    const url = params.size ? `/api/market?${params}` : "/api/market";
    const promise = fetch(url, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok && !Array.isArray(data.quotes)) throw new Error(data.warning || "market request failed");
        const result = data as MarketResponse;
        return { ...result, quotes: normalizeExchangeQuotes(Array.isArray(result.quotes) ? result.quotes : [], targets) };
      })
      .finally(() => { if (inFlight?.promise === promise) inFlight = null; });
    inFlight = { key, promise };
  }
  return inFlight.promise;
}

async function latestCachedQuotes() {
  const rows = await db.marketSnapshots.orderBy("capturedAt").reverse().toArray();
  const latest = new Map<string, MarketSnapshot>();
  for (const row of rows) {
    const key = row.marketId && (row.source === "tsetmc" || row.source === "tindex")
      ? `${row.source}:${row.marketId}`
      : row.symbol;
    if (!latest.has(key)) latest.set(key, row);
  }
  return [...latest.values()];
}

export function useMarket(assets: Asset[] = [], watchlist: MarketWatchItem[] = [], alerts: MarketAlert[] = [], enabled = true) {
  const targetsKey = useMemo(() => JSON.stringify(targetDescriptors(assets, watchlist, alerts)), [alerts, assets, watchlist]);
  const targets = useMemo(() => JSON.parse(targetsKey) as MarketTarget[], [targetsKey]);
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [coverage, setCoverage] = useState<MarketCoverage>(EMPTY_COVERAGE);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | undefined>();
  const [health, setHealth] = useState<MarketHealthSummary | undefined>();

  const applyCached = useCallback((cached: MarketSnapshot[]) => {
    const merged = mergeRuntimeMarketQuotes({ fresh: [], cached, targets });
    setQuotes(merged.quotes);
    setCoverage(merged.coverage);
    if (merged.quotes.length) {
      setMode("offline");
      setLastUpdated(merged.coverage.newestSnapshotAt ?? null);
    }
    return merged;
  }, [targets]);

  const applyResponse = useCallback(async (data: MarketResponse) => {
    const rows = Array.isArray(data.quotes) ? data.quotes : [];
    const cached = await latestCachedQuotes();
    const merged = mergeRuntimeMarketQuotes({ fresh: rows, cached, targets });
    setQuotes(merged.quotes);
    setCoverage(merged.coverage);
    setWarning(data.warning);
    setHealth(data.health);

    if (!rows.length) {
      setMode(merged.coverage.snapshot ? "offline" : (data.mode || "unavailable"));
      setLastUpdated(merged.coverage.newestSnapshotAt ?? data.fetchedAt ?? null);
      return;
    }

    const capturedAt = data.fetchedAt || new Date().toISOString();
    setMode(data.mode || "live");
    setLastUpdated(capturedAt);
    await db.marketSnapshots.bulkAdd(rows.map((quote) => ({ ...marketQuoteForStorage(quote), capturedAt })));
    const count = await db.marketSnapshots.count();
    if (count > 5000) {
      const oldIds = await db.marketSnapshots.orderBy("capturedAt").limit(count - 5000).primaryKeys();
      await db.marketSnapshots.bulkDelete(oldIds as number[]);
    }
  }, [targets]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      await applyResponse(await requestMarket(targets));
    } catch {
      const cached = await latestCachedQuotes();
      const merged = applyCached(cached);
      if (!merged.quotes.length) setMode("unavailable");
      setHealth(undefined);
      setWarning("دریافت قیمت جدید ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [applyCached, applyResponse, enabled, targets]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void latestCachedQuotes().then(async (cached) => {
      if (!active) return;
      applyCached(cached);
      try {
        const data = await requestMarket(targets);
        if (active) await applyResponse(data);
      } catch {
        if (active) setWarning("دریافت قیمت جدید ناموفق بود.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [applyCached, applyResponse, enabled, targets, targetsKey]);

  return { quotes, coverage, loading, mode, lastUpdated, warning, health, refresh };
}
