import type { AllocationRule } from "@/lib/types";

export type ReportBucket = "life" | "safety" | "growth";
export type ReportHealth = "empty" | "attention" | "steady" | "strong";

export interface ReportBucketMetric {
  bucket: ReportBucket;
  actualPct: number;
  targetPct: number;
  driftPct: number;
}

export interface ReportDecisionSnapshot {
  totalIncome: number;
  allocatedTotal: number;
  unallocatedToman: number;
  allocationCoveragePct: number;
  allocationReliable: boolean;
  allocationTargetsValid: boolean;
  buckets: ReportBucketMetric[];
  largestUnderTarget?: ReportBucketMetric;
  plan: { planned: number; executed: number; remaining: number; pct: number; health: ReportHealth };
  funds: { funded: number; target: number; remaining: number; pct: number; health: ReportHealth };
}

const TARGET_TOLERANCE_PCT = 1;
const ALLOCATION_COVERAGE_TOLERANCE = 0.01;

export function buildReportDecisionSnapshot(input: {
  totalIncome: number;
  allocations: Record<ReportBucket, number>;
  rule?: AllocationRule;
  planPlanned: number;
  planExecuted: number;
  funded: number;
  fundTarget: number;
}): ReportDecisionSnapshot {
  const totalIncome = nonNegative(input.totalIncome);
  const allocations = {
    life: nonNegative(input.allocations.life),
    safety: nonNegative(input.allocations.safety),
    growth: nonNegative(input.allocations.growth),
  };
  const allocatedTotal = allocations.life + allocations.safety + allocations.growth;
  const allocationCoveragePct = totalIncome > 0 ? clamp(allocatedTotal / totalIncome * 100, 0, 100) : 0;
  const allocationReliable = totalIncome > 0
    && allocatedTotal > 0
    && Math.abs(allocatedTotal - totalIncome) <= Math.max(1, totalIncome * ALLOCATION_COVERAGE_TOLERANCE);
  const targets = ruleTargets(input.rule);
  const allocationTargetsValid = Boolean(targets && Math.abs(targets.total - 100) <= TARGET_TOLERANCE_PCT);
  const buckets = (["life", "safety", "growth"] as const).map((bucket) => {
    const actualPct = allocatedTotal > 0 ? allocations[bucket] / allocatedTotal * 100 : 0;
    const targetPct = targets?.[bucket] ?? 0;
    return { bucket, actualPct: finite(actualPct), targetPct, driftPct: finite(actualPct - targetPct) };
  });
  const largestUnderTarget = allocationReliable && allocationTargetsValid
    ? buckets
      .filter((row) => row.driftPct < -TARGET_TOLERANCE_PCT)
      .sort((a, b) => a.driftPct - b.driftPct || bucketOrder(a.bucket) - bucketOrder(b.bucket))[0]
    : undefined;
  const planned = nonNegative(input.planPlanned);
  const executed = Math.min(planned, nonNegative(input.planExecuted));
  const planPct = planned > 0 ? clamp(executed / planned * 100, 0, 100) : 0;
  const funded = nonNegative(input.funded);
  const target = nonNegative(input.fundTarget);
  const fundPct = target > 0 ? clamp(funded / target * 100, 0, 100) : 0;

  return {
    totalIncome,
    allocatedTotal,
    unallocatedToman: Math.max(0, totalIncome - allocatedTotal),
    allocationCoveragePct: finite(allocationCoveragePct),
    allocationReliable,
    allocationTargetsValid,
    buckets,
    largestUnderTarget,
    plan: { planned, executed, remaining: Math.max(0, planned - executed), pct: finite(planPct), health: planHealth(planned, planPct) },
    funds: { funded, target, remaining: Math.max(0, target - funded), pct: finite(fundPct), health: fundHealth(target, fundPct) },
  };
}

export function reportBucketLabel(bucket: ReportBucket) {
  return bucket === "life" ? "زندگی" : bucket === "safety" ? "امنیت" : "رشد";
}

function ruleTargets(rule?: AllocationRule) {
  if (!rule) return undefined;
  const life = nonNegative(rule.lifePct);
  const safety = nonNegative(rule.safetyPct);
  const growth = nonNegative(rule.growthPct);
  return { life, safety, growth, total: life + safety + growth };
}

function planHealth(planned: number, pct: number): ReportHealth {
  if (planned <= 0) return "empty";
  if (pct >= 90) return "strong";
  if (pct >= 70) return "steady";
  return "attention";
}

function fundHealth(target: number, pct: number): ReportHealth {
  if (target <= 0) return "empty";
  if (pct >= 80) return "strong";
  if (pct >= 50) return "steady";
  return "attention";
}

function bucketOrder(bucket: ReportBucket) {
  return bucket === "life" ? 0 : bucket === "safety" ? 1 : 2;
}

function nonNegative(value: number) {
  return Math.max(0, finite(value));
}

function finite(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
