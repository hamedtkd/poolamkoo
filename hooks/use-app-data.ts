"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, defaultSettings, ensureSeedData } from "@/lib/db";
import {
  LOCAL_DATA_BLOCKED_CODE,
  LOCAL_DATA_BLOCKED_EVENT,
  LOCAL_DATA_TIMEOUT_CODE,
  LOCAL_DATA_VERSION_CHANGE_CODE,
  LOCAL_DATA_VERSION_CHANGE_EVENT,
  classifyLocalDataIssue,
} from "@/lib/local-data-issues";

type BootstrapState = { status: "loading" | "ready" | "error"; error?: unknown };
const BOOT_TIMEOUT_MS = 12_000;

export function useAppData() {
  const [bootstrap, setBootstrap] = useState<BootstrapState>({ status: "loading" });
  const runRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const failBootstrap = useCallback((code: string) => {
    runRef.current += 1;
    clearTimer();
    setBootstrap({ status: "error", error: new Error(code) });
  }, [clearTimer]);

  const performBootstrap = useCallback((run: number) => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (run === runRef.current) failBootstrap(LOCAL_DATA_TIMEOUT_CODE);
    }, BOOT_TIMEOUT_MS);

    void db.open()
      .then(() => ensureSeedData())
      .then(() => {
        if (run !== runRef.current) return;
        clearTimer();
        setBootstrap({ status: "ready" });
      })
      .catch((error) => {
        if (run !== runRef.current) return;
        clearTimer();
        setBootstrap({ status: "error", error });
      });
  }, [clearTimer, failBootstrap]);

  const retryBootstrap = useCallback(() => {
    if (classifyLocalDataIssue(bootstrap.error).action === "reload") {
      window.location.reload();
      return;
    }
    db.close();
    const run = ++runRef.current;
    setBootstrap({ status: "loading" });
    performBootstrap(run);
  }, [bootstrap.error, performBootstrap]);

  useEffect(() => {
    const onBlocked = () => failBootstrap(LOCAL_DATA_BLOCKED_CODE);
    const onVersionChange = () => failBootstrap(LOCAL_DATA_VERSION_CHANGE_CODE);
    window.addEventListener(LOCAL_DATA_BLOCKED_EVENT, onBlocked);
    window.addEventListener(LOCAL_DATA_VERSION_CHANGE_EVENT, onVersionChange);
    return () => {
      window.removeEventListener(LOCAL_DATA_BLOCKED_EVENT, onBlocked);
      window.removeEventListener(LOCAL_DATA_VERSION_CHANGE_EVENT, onVersionChange);
    };
  }, [failBootstrap]);

  useEffect(() => {
    const run = ++runRef.current;
    performBootstrap(run);
    return () => {
      runRef.current += 1;
      clearTimer();
    };
  }, [clearTimer, performBootstrap]);

  const canQuery = bootstrap.status === "ready";
  const settingsQuery = useLiveQuery(() => canQuery ? db.settings.get("settings") : undefined, [canQuery]);
  const settings = settingsQuery ? { ...defaultSettings, ...settingsQuery } : defaultSettings;
  const ready = canQuery && settingsQuery !== undefined;
  const rule = useLiveQuery(() => canQuery ? db.allocationRules.filter((item) => item.isActive).first() : undefined, [canQuery]);
  const incomes = useLiveQuery(() => canQuery ? db.incomes.orderBy("happenedAt").reverse().toArray() : [], [canQuery]) ?? [];
  const allocations = useLiveQuery(() => canQuery ? db.allocations.toArray() : [], [canQuery]) ?? [];
  const funds = useLiveQuery(() => canQuery ? db.funds.orderBy("updatedAt").reverse().toArray() : [], [canQuery]) ?? [];
  const allAssetsQuery = useLiveQuery(() => canQuery ? db.assets.toArray() : [], [canQuery]);
  const allAssets = useMemo(() => allAssetsQuery ?? [], [allAssetsQuery]);
  const assets = useMemo(() => allAssets.filter((asset) => !asset.archived), [allAssets]);
  const archivedAssets = useMemo(() => allAssets.filter((asset) => asset.archived), [allAssets]);
  const transactions = useLiveQuery(() => canQuery ? db.transactions.toArray() : [], [canQuery]) ?? [];
  const snapshots = useLiveQuery(() => canQuery ? db.marketSnapshots.orderBy("capturedAt").reverse().limit(1000).toArray() : [], [canQuery]) ?? [];
  const watchlist = useLiveQuery(() => canQuery ? db.marketWatchlist.orderBy("updatedAt").reverse().toArray() : [], [canQuery]) ?? [];
  const marketAlerts = useLiveQuery(() => canQuery ? db.marketAlerts.orderBy("updatedAt").reverse().toArray() : [], [canQuery]) ?? [];
  const planItems = useLiveQuery(() => canQuery ? db.planItems.toArray() : [], [canQuery]) ?? [];

  return {
    ready,
    bootstrapError: bootstrap.status === "error" ? bootstrap.error : null,
    retryBootstrap,
    settings,
    rule,
    incomes,
    allocations,
    funds,
    assets,
    allAssets,
    archivedAssets,
    transactions,
    snapshots,
    watchlist,
    marketAlerts,
    planItems,
  };
}
