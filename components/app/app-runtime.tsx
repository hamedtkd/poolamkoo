"use client";

import { createContext, useContext } from "react";
import type { useAppData } from "@/hooks/use-app-data";
import type { useAppDateFilter } from "@/hooks/use-app-date-filter";
import type { useBackgroundPush } from "@/hooks/use-background-push";
import type { useBackupSafety } from "@/hooks/use-backup-safety";
import type { useMarket } from "@/hooks/use-market";

type AppData = ReturnType<typeof useAppData>;
type MarketData = ReturnType<typeof useMarket>;
type DateFilter = ReturnType<typeof useAppDateFilter>;
type BackgroundPush = ReturnType<typeof useBackgroundPush>;
type BackupSafety = ReturnType<typeof useBackupSafety>;

interface AppRuntimeValue {
  data: AppData;
  market: MarketData;
  dateFilter: DateFilter;
  backgroundPush: BackgroundPush;
  backupSafety: BackupSafety;
}

const AppRuntimeContext = createContext<AppRuntimeValue | null>(null);

export function AppRuntimeProvider({ value, children }: { value: AppRuntimeValue; children: React.ReactNode }) {
  return <AppRuntimeContext.Provider value={value}>{children}</AppRuntimeContext.Provider>;
}

export function useAppRuntime() {
  const value = useContext(AppRuntimeContext);
  if (!value) throw new Error("useAppRuntime must be used inside AppRuntimeProvider");
  return value;
}
