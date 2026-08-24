import type { PlanItem } from "./types.ts";

export type PlanItemLike = Partial<PlanItem> | null | undefined;

function safeAmount(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function normalizePlanItems(items?: readonly PlanItemLike[] | null): PlanItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is Partial<PlanItem> => Boolean(item)).map((item) => ({
    id: item.id,
    incomeId: Number.isFinite(item.incomeId) ? Number(item.incomeId) : 0,
    bucket: item.bucket ?? "life",
    targetType: item.targetType ?? "bucket",
    targetId: item.targetId,
    label: typeof item.label === "string" && item.label.trim() ? item.label : "برنامه مالی",
    plannedToman: safeAmount(item.plannedToman),
    executedToman: safeAmount(item.executedToman),
    createdAt: typeof item.createdAt === "string" && item.createdAt ? item.createdAt : new Date(0).toISOString(),
    updatedAt: typeof item.updatedAt === "string" && item.updatedAt ? item.updatedAt : new Date(0).toISOString(),
  }));
}

export function planRemaining(item?: PlanItemLike) {
  if (!item) return 0;
  return Math.max(0, safeAmount(item.plannedToman) - safeAmount(item.executedToman));
}

export function planProgress(item?: PlanItemLike) {
  if (!item) return 0;
  const planned = safeAmount(item.plannedToman);
  if (planned <= 0) return 100;
  return Math.min(100, (safeAmount(item.executedToman) / planned) * 100);
}

export function incomePlanProgress(items?: readonly PlanItemLike[] | null) {
  const normalized = normalizePlanItems(items);
  const planned = normalized.reduce((sum, item) => sum + item.plannedToman, 0);
  const executed = normalized.reduce(
    (sum, item) => sum + Math.min(item.executedToman, item.plannedToman),
    0,
  );
  return { planned, executed, pct: planned > 0 ? (executed / planned) * 100 : 0 };
}
