"use client";

import * as React from "react";
import type { ReturnTypeOfAppData } from "@/lib/runtime-types";
import { dateInRange, emptyDateRange, type AppDateRange } from "@/lib/date-range";

const STORAGE_KEY = "poolamkoo:date-ranges";
const CHANGE_EVENT = "poolamkoo:date-ranges-change";
export type DateFilterScope = "dashboard" | "income" | "reports" | "investments";

type ScopedRanges = Record<DateFilterScope, AppDateRange>;

interface StoredRanges {
  dashboard?: { from?: string | null; to?: string | null };
  income?: { from?: string | null; to?: string | null };
  reports?: { from?: string | null; to?: string | null };
  investments?: { from?: string | null; to?: string | null };
}

const defaultRanges = (): ScopedRanges => ({
  dashboard: emptyDateRange(),
  income: emptyDateRange(),
  reports: emptyDateRange(),
  investments: emptyDateRange(),
});

function toStoredRange(range: AppDateRange) {
  return {
    from: range.from?.toISOString() ?? null,
    to: range.to?.toISOString() ?? null,
  };
}

function fromStoredRange(range?: { from?: string | null; to?: string | null }): AppDateRange {
  return {
    from: range?.from ? new Date(range.from) : null,
    to: range?.to ? new Date(range.to) : null,
  };
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parseRanges(snapshot: string): ScopedRanges {
  if (!snapshot) return defaultRanges();
  try {
    const parsed = JSON.parse(snapshot) as StoredRanges;
    return {
      dashboard: fromStoredRange(parsed.dashboard),
      income: fromStoredRange(parsed.income),
      reports: fromStoredRange(parsed.reports),
      investments: fromStoredRange(parsed.investments),
    };
  } catch {
    return defaultRanges();
  }
}

export function useAppDateFilter(data: ReturnTypeOfAppData) {
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, () => "");
  const ranges = React.useMemo(() => parseRanges(snapshot), [snapshot]);

  const setRange = React.useCallback((scope: DateFilterScope, next: AppDateRange) => {
    const current = parseRanges(getSnapshot());
    const updated = { ...current, [scope]: next };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        dashboard: toStoredRange(updated.dashboard),
        income: toStoredRange(updated.income),
        reports: toStoredRange(updated.reports),
        investments: toStoredRange(updated.investments),
      }));
    } catch {
      // Session storage can be unavailable in hardened browsers.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const filtered = React.useMemo(() => {
    const build = (range: AppDateRange) => {
      const incomes = data.incomes.filter((row) => dateInRange(row.happenedAt, range));
      const incomeIds = new Set(incomes.flatMap((row) => (row.id ? [row.id] : [])));
      return {
        incomes,
        allocations: data.allocations.filter((row) => incomeIds.has(row.incomeId)),
        planItems: data.planItems.filter((row) => incomeIds.has(row.incomeId)),
        transactions: data.transactions.filter((row) => dateInRange(row.happenedAt, range)),
        snapshots: data.snapshots.filter((row) => dateInRange(row.capturedAt, range)),
      };
    };

    return {
      dashboard: build(ranges.dashboard),
      income: build(ranges.income),
      reports: build(ranges.reports),
      investments: build(ranges.investments),
    };
  }, [data.allocations, data.incomes, data.planItems, data.snapshots, data.transactions, ranges]);

  return {
    ranges,
    getRange: (scope: DateFilterScope) => ranges[scope],
    setRange,
    filtered,
    filteredFor: (scope: DateFilterScope) => filtered[scope],
  };
}
