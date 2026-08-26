"use client";

import { useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { COMMUNITY_USAGE_META_KEY, isSupportPromptDue, parseCommunityUsage, withSupportAction, withUsageDay, type CommunityUsageState } from "@/lib/community";
import { db } from "@/lib/db";

async function writeUsage(update: (state: CommunityUsageState | null) => CommunityUsageState) {
  await db.transaction("rw", db.appMeta, async () => {
    const row = await db.appMeta.get(COMMUNITY_USAGE_META_KEY);
    const next = update(parseCommunityUsage(row?.value));
    await db.appMeta.put({ key: COMMUNITY_USAGE_META_KEY, value: JSON.stringify(next), updatedAt: new Date().toISOString() });
  });
}

export function useCommunitySupport(enabled: boolean) {
  const row = useLiveQuery(() => enabled ? db.appMeta.get(COMMUNITY_USAGE_META_KEY) : undefined, [enabled]);
  const state = useMemo(() => parseCommunityUsage(row?.value), [row?.value]);
  const due = enabled && isSupportPromptDue(state);

  useEffect(() => {
    if (!enabled) return;
    void writeUsage((current) => withUsageDay(current));
  }, [enabled]);

  async function act(action: CommunityUsageState["lastAction"]) {
    await writeUsage((current) => withSupportAction(withUsageDay(current), action));
  }

  return { due, activeDays: state?.activeDays.length ?? 0, act };
}
