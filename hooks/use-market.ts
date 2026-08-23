"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { MarketQuote, MarketSnapshot } from "@/lib/types";

type MarketResponse = {
  mode?: string;
  quotes?: MarketQuote[];
  warning?: string;
  fetchedAt?: string;
};

let initialRequestStarted = false;
let inFlight: Promise<MarketResponse> | null = null;

async function requestMarket() {
  if (!inFlight) {
    inFlight = fetch("/api/market", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok && !Array.isArray(data.quotes)) throw new Error(data.warning || "market request failed");
        return data as MarketResponse;
      })
      .finally(() => { inFlight = null; });
  }
  return inFlight;
}

async function latestCachedQuotes() {
  const rows = await db.marketSnapshots.orderBy("capturedAt").reverse().toArray();
  const latest = new Map<string, MarketSnapshot>();
  for (const row of rows) if (!latest.has(row.symbol)) latest.set(row.symbol, row);
  return [...latest.values()];
}

export function useMarket() {
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
      const ids = await db.marketSnapshots.orderBy("capturedAt").limit(count - 5000).primaryKeys();
      await db.marketSnapshots.bulkDelete(ids as number[]);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await requestMarket();
      await applyResponse(data);
    } catch {
      const cached = await latestCachedQuotes();
      setQuotes(cached);
      setMode(cached.length ? "offline" : "unavailable");
      setLastUpdated(cached[0]?.capturedAt ?? null);
      setWarning("\u062f\u0631\u06cc\u0627\u0641\u062a \u0642\u06cc\u0645\u062a \u062c\u062f\u06cc\u062f \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062f.");
    } finally {
      setLoading(false);
    }
  }, [applyResponse]);

  useEffect(() => {
    let active = true;
    latestCachedQuotes().then((cached) => {
      if (!active || !cached.length) return;
      setQuotes(cached);
      setMode("offline");
      setLastUpdated(cached[0]?.capturedAt ?? null);
    });
    if (!initialRequestStarted) {
      initialRequestStarted = true;
      void refresh();
    } else {
      setLoading(false);
    }
    return () => { active = false; };
  }, [refresh]);

  return { quotes, loading, mode, lastUpdated, warning, refresh };
}
