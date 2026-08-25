"use client";

import { useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BACKUP_SNOOZE_DAYS, calculateBackupHealth } from "@/lib/backup-safety";
import { BACKUP_LAST_SUCCESS_KEY, BACKUP_SNOOZE_UNTIL_KEY } from "@/lib/backup-client";
import { setAppMeta } from "@/lib/app-meta";
import { db } from "@/lib/db";
import { ensurePeriodicRecoverySnapshot } from "@/lib/recovery";
import type { GoalFund, IncomeEvent, InvestmentTransaction, PlanItem } from "@/lib/types";

type BackupUsageData = {
  incomes: IncomeEvent[];
  transactions: InvestmentTransaction[];
  planItems: PlanItem[];
  funds: GoalFund[];
};

function firstTime(values: Array<string | undefined>) {
  const times = values.map((value) => value ? new Date(value).getTime() : Number.NaN).filter(Number.isFinite);
  return times.length ? new Date(Math.min(...times)).toISOString() : undefined;
}

export function useBackupSafety(data: BackupUsageData) {
  const metaQuery = useLiveQuery(() => db.appMeta.toArray(), []);
  const snapshotsQuery = useLiveQuery(() => db.recoverySnapshots.orderBy("createdAt").reverse().limit(5).toArray(), []);
  const snapshots = snapshotsQuery ?? [];
  const ready = metaQuery !== undefined && snapshotsQuery !== undefined;
  const metaMap = useMemo(() => new Map((metaQuery ?? []).map((row) => [row.key, row.value])), [metaQuery]);
  const meaningfulFunds = data.funds.filter((fund) => fund.currentToman > 0);
  const meaningfulCount = data.incomes.length + data.transactions.length + data.planItems.length + meaningfulFunds.length;
  const firstMeaningfulAt = firstTime([
    ...data.incomes.flatMap((row) => [row.createdAt, row.happenedAt]),
    ...data.transactions.flatMap((row) => [row.createdAt, row.happenedAt]),
    ...data.planItems.map((row) => row.createdAt),
    ...meaningfulFunds.map((row) => row.createdAt),
  ]);
  const calculatedHealth = calculateBackupHealth({
    lastBackupAt: metaMap.get(BACKUP_LAST_SUCCESS_KEY),
    snoozedUntil: metaMap.get(BACKUP_SNOOZE_UNTIL_KEY),
    meaningfulCount,
    firstMeaningfulAt,
  });
  const health = ready ? calculatedHealth : { ...calculatedHealth, shouldRemind: false };

  useEffect(() => {
    if (meaningfulCount > 0) void ensurePeriodicRecoverySnapshot().catch(() => undefined);
  }, [meaningfulCount]);

  async function snoozeReminder() {
    const until = new Date(Date.now() + BACKUP_SNOOZE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await setAppMeta(BACKUP_SNOOZE_UNTIL_KEY, until);
  }

  return { ready, health, snapshots, meaningfulCount, snoozeReminder };
}
