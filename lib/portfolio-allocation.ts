import type { Asset } from "@/lib/types";

export const ALLOCATION_NEAR_TARGET_TOLERANCE_PCT = 1;
export const TARGET_TOTAL_TOLERANCE_PCT = 0.01;

export type AllocationStatus = "underweight" | "near-target" | "overweight" | "no-target";

export interface PortfolioAllocationInput {
  asset: Asset;
  currentValue: number;
  hasHolding?: boolean;
  pricingReliable?: boolean;
}

export interface PortfolioAllocationRow {
  asset: Asset;
  currentValue: number;
  currentPct: number;
  targetPct: number;
  targetValue: number;
  driftPct: number;
  gapValue: number;
  status: AllocationStatus;
  pricingReliable: boolean;
}

export interface PortfolioAllocationReview {
  rows: PortfolioAllocationRow[];
  totalValue: number;
  totalTargetPct: number;
  targetsValid: boolean;
  pricingIncomplete: boolean;
  underweightRows: PortfolioAllocationRow[];
  overweightRows: PortfolioAllocationRow[];
  largestDrifts: PortfolioAllocationRow[];
  newMoneyPriorities: PortfolioAllocationRow[];
}

function finite(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function compareStable(a: PortfolioAllocationRow, b: PortfolioAllocationRow) {
  const aId = a.asset.id ?? Number.MAX_SAFE_INTEGER;
  const bId = b.asset.id ?? Number.MAX_SAFE_INTEGER;
  if (aId !== bId) return aId - bId;
  return a.asset.name.localeCompare(b.asset.name, "fa");
}

function statusFor(targetPct: number, driftPct: number): AllocationStatus {
  if (targetPct <= 0) return "no-target";
  if (Math.abs(driftPct) <= ALLOCATION_NEAR_TARGET_TOLERANCE_PCT) return "near-target";
  return driftPct < 0 ? "underweight" : "overweight";
}

export function buildPortfolioAllocation(inputs: PortfolioAllocationInput[]): PortfolioAllocationReview {
  const totalValue = inputs.reduce((sum, input) => sum + Math.max(0, finite(input.currentValue)), 0);
  const totalTargetPct = inputs.reduce((sum, input) => sum + Math.max(0, finite(input.asset.targetPct)), 0);
  const targetsValid = inputs.length > 0 && Math.abs(totalTargetPct - 100) <= TARGET_TOTAL_TOLERANCE_PCT;

  const rows = inputs.map<PortfolioAllocationRow>((input) => {
    const currentValue = Math.max(0, finite(input.currentValue));
    const targetPct = Math.max(0, finite(input.asset.targetPct));
    const currentPct = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
    const targetValue = totalValue > 0 ? (totalValue * targetPct) / 100 : 0;
    const driftPct = currentPct - targetPct;
    const gapValue = targetValue - currentValue;
    return {
      asset: input.asset,
      currentValue,
      currentPct: finite(currentPct),
      targetPct,
      targetValue: finite(targetValue),
      driftPct: finite(driftPct),
      gapValue: finite(gapValue),
      status: statusFor(targetPct, driftPct),
      pricingReliable: input.pricingReliable !== false,
    };
  });

  const byGap = (a: PortfolioAllocationRow, b: PortfolioAllocationRow) =>
    b.gapValue - a.gapValue || Math.abs(b.driftPct) - Math.abs(a.driftPct) || compareStable(a, b);
  const byDrift = (a: PortfolioAllocationRow, b: PortfolioAllocationRow) =>
    Math.abs(b.driftPct) - Math.abs(a.driftPct) || compareStable(a, b);

  const underweightRows = rows.filter((row) => row.status === "underweight").sort(byGap);
  const overweightRows = rows.filter((row) => row.status === "overweight").sort((a, b) => a.gapValue - b.gapValue || byDrift(a, b));
  const pricingIncomplete = inputs.some((input) => Boolean(input.hasHolding) && input.pricingReliable === false);
  const newMoneyPriorities = targetsValid && totalValue > 0 && !pricingIncomplete ? [...underweightRows] : [];

  return {
    rows,
    totalValue,
    totalTargetPct,
    targetsValid,
    pricingIncomplete,
    underweightRows,
    overweightRows,
    largestDrifts: [...rows].sort(byDrift),
    newMoneyPriorities,
  };
}
