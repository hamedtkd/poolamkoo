export const COMMUNITY_LINKS = {
  repository: "https://github.com/hamedtkd/poolamkoo",
  issues: "https://github.com/hamedtkd/poolamkoo/issues/new",
  security: "https://github.com/hamedtkd/poolamkoo/blob/main/SECURITY.md",
  license: "https://github.com/hamedtkd/poolamkoo/blob/main/LICENSE",
  support: "https://daramet.com/hamedtkd",
  maintainer: "https://github.com/hamedtkd",
  tindex: "https://tindex.app",
} as const;

export const COMMUNITY_USAGE_META_KEY = "community:usage:v1";
export const SUPPORT_PROMPT_ACTIVE_DAYS = 7;
export const SUPPORT_PROMPT_SNOOZE_DAYS = 60;
export const SUPPORT_PROMPT_THANKS_DAYS = 180;

export interface CommunityUsageState {
  firstUsedAt: string;
  activeDays: string[];
  snoozedUntil?: string;
  lastPromptAt?: string;
  lastAction?: "github" | "support" | "later";
}

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseCommunityUsage(value?: string | null): CommunityUsageState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<CommunityUsageState>;
    if (typeof parsed.firstUsedAt !== "string" || !Array.isArray(parsed.activeDays)) return null;
    const activeDays = [...new Set(parsed.activeDays.filter((item): item is string => typeof item === "string"))].sort().slice(-120);
    return { ...parsed, firstUsedAt: parsed.firstUsedAt, activeDays } as CommunityUsageState;
  } catch {
    return null;
  }
}

export function withUsageDay(state: CommunityUsageState | null, now = new Date()): CommunityUsageState {
  const today = localDayKey(now);
  const current: CommunityUsageState = state ?? { firstUsedAt: now.toISOString(), activeDays: [] };
  const activeDays = [...new Set([...current.activeDays, today])].sort().slice(-120);
  return { ...current, activeDays };
}

export function isSupportPromptDue(state: CommunityUsageState | null, now = new Date()) {
  if (!state || state.activeDays.length < SUPPORT_PROMPT_ACTIVE_DAYS) return false;
  const snoozed = state.snoozedUntil ? new Date(state.snoozedUntil).getTime() : 0;
  return !Number.isFinite(snoozed) || snoozed <= now.getTime();
}

export function withSupportAction(state: CommunityUsageState, action: CommunityUsageState["lastAction"], now = new Date()): CommunityUsageState {
  const days = action === "later" ? SUPPORT_PROMPT_SNOOZE_DAYS : SUPPORT_PROMPT_THANKS_DAYS;
  const snoozedUntil = new Date(now.getTime() + days * 86_400_000).toISOString();
  return { ...state, lastAction: action, lastPromptAt: now.toISOString(), snoozedUntil };
}
