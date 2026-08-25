"use client";

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, defaultSettings, ensureSeedData } from "@/lib/db";

export function useAppData() {
  useEffect(() => { void ensureSeedData(); }, []);
  const settingsQuery = useLiveQuery(() => db.settings.get("settings"), []);
  const settings = settingsQuery ? { ...defaultSettings, ...settingsQuery } : defaultSettings;
  const ready = settingsQuery !== undefined;
  const rule = useLiveQuery(() => db.allocationRules.filter((item) => item.isActive).first(), []);
  const incomes = useLiveQuery(() => db.incomes.orderBy("happenedAt").reverse().toArray(), []) ?? [];
  const allocations = useLiveQuery(() => db.allocations.toArray(), []) ?? [];
  const funds = useLiveQuery(() => db.funds.orderBy("updatedAt").reverse().toArray(), []) ?? [];
  const assets = useLiveQuery(() => db.assets.filter((a) => !a.archived).toArray(), []) ?? [];
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) ?? [];
  const snapshots = useLiveQuery(() => db.marketSnapshots.orderBy("capturedAt").reverse().limit(1000).toArray(), []) ?? [];
  const watchlist = useLiveQuery(() => db.marketWatchlist.orderBy("updatedAt").reverse().toArray(), []) ?? [];
  const marketAlerts = useLiveQuery(() => db.marketAlerts.orderBy("updatedAt").reverse().toArray(), []) ?? [];
  const planItems = useLiveQuery(() => db.planItems.toArray(), []) ?? [];
  return { ready, settings, rule, incomes, allocations, funds, assets, transactions, snapshots, watchlist, marketAlerts, planItems };
}
