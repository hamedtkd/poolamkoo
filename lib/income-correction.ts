import type { AllocationEntry, BucketKey, IncomeEvent, InvestmentTransaction, PlanItem } from "./types.ts";

export type IncomeCorrectionIssue = "amount_below_executed" | "date_locked_after_execution";

export type IncomeCorrectionReview = {
  valid: boolean;
  issue: IncomeCorrectionIssue | null;
  executedTotal: number;
  dateLocked: boolean;
  plannedTotal: number;
  planUpdates: Array<{ id: number; plannedToman: number }>;
  allocationTargets: Record<BucketKey, number>;
  allocationUpdates: Array<{ id: number; amountToman: number }>;
  allocationAdds: Array<{ bucket: BucketKey; amountToman: number }>;
};

const buckets: BucketKey[] = ["life", "safety", "growth"];

function money(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
}

function distribute(total: number, weights: number[]) {
  const safeTotal = Math.max(0, Math.round(total));
  const safeWeights = weights.map((value) => Math.max(0, Number.isFinite(value) ? value : 0));
  const weightTotal = safeWeights.reduce((sum, value) => sum + value, 0);
  if (safeTotal <= 0 || weightTotal <= 0) return safeWeights.map(() => 0);
  const exact = safeWeights.map((weight) => safeTotal * weight / weightTotal);
  const result = exact.map(Math.floor);
  let remainder = safeTotal - result.reduce((sum, value) => sum + value, 0);
  const order = exact.map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; remainder > 0; index = (index + 1) % order.length) {
    result[order[index].index] += 1;
    remainder -= 1;
  }
  return result;
}

function linkedInvestmentByPlan(transactions: readonly InvestmentTransaction[]) {
  const byPlan = new Map<number, number>();
  let unplanned = 0;
  for (const transaction of transactions) {
    if (transaction.type !== "buy") continue;
    const amount = money(transaction.amountToman);
    if (transaction.planItemId) byPlan.set(transaction.planItemId, (byPlan.get(transaction.planItemId) ?? 0) + amount);
    else unplanned += amount;
  }
  return { byPlan, unplanned };
}

function planExecutionFloor(item: PlanItem, linkedByPlan: Map<number, number>) {
  const recorded = money(item.executedToman);
  if (item.targetType !== "asset" || !item.id) return recorded;
  return Math.max(recorded, linkedByPlan.get(item.id) ?? 0);
}

function scaleAllocationsWithoutPlan(allocations: readonly AllocationEntry[], oldAmount: number, newAmount: number) {
  const currentTotal = allocations.reduce((sum, row) => sum + money(row.amountToman), 0);
  const ratio = oldAmount > 0 ? newAmount / oldAmount : 1;
  const targetTotal = Math.min(newAmount, Math.max(0, Math.round(currentTotal * ratio)));
  const bucketWeights = buckets.map((bucket) => allocations
    .filter((row) => row.bucket === bucket)
    .reduce((sum, row) => sum + money(row.amountToman), 0));
  const shares = distribute(targetTotal, bucketWeights);
  return Object.fromEntries(buckets.map((bucket, index) => [bucket, shares[index]])) as Record<BucketKey, number>;
}


function allocationMutations(allocations: readonly AllocationEntry[], targets: Record<BucketKey, number>) {
  const allocationUpdates: Array<{ id: number; amountToman: number }> = [];
  const allocationAdds: Array<{ bucket: BucketKey; amountToman: number }> = [];
  for (const bucket of buckets) {
    const rows = allocations.filter((row) => row.bucket === bucket && row.id);
    const target = targets[bucket];
    if (rows.length === 0) {
      if (target > 0) allocationAdds.push({ bucket, amountToman: target });
      continue;
    }
    const weights = rows.map((row) => money(row.amountToman));
    const shares = distribute(target, weights.some((value) => value > 0) ? weights : rows.map((_, index) => index === 0 ? 1 : 0));
    rows.forEach((row, index) => allocationUpdates.push({ id: row.id!, amountToman: shares[index] }));
  }
  return { allocationUpdates, allocationAdds };
}

export function reviewIncomeCorrection({
  income,
  nextAmountToman,
  nextHappenedAt,
  planItems,
  allocations,
  linkedTransactions = [],
}: {
  income: IncomeEvent;
  nextAmountToman: number;
  nextHappenedAt: string;
  planItems: readonly PlanItem[];
  allocations: readonly AllocationEntry[];
  linkedTransactions?: readonly InvestmentTransaction[];
}): IncomeCorrectionReview {
  const amount = money(nextAmountToman);
  const linked = linkedInvestmentByPlan(linkedTransactions);
  const normalized = planItems.map((item) => {
    const executed = planExecutionFloor(item, linked.byPlan);
    const planned = Math.max(executed, money(item.plannedToman));
    return { item, executed, planned, remaining: Math.max(0, planned - executed) };
  });
  const planExecuted = normalized.reduce((sum, row) => sum + row.executed, 0);
  const executedTotal = planExecuted + linked.unplanned;
  const dateLocked = executedTotal > 0 || linkedTransactions.length > 0;
  const dateChanged = nextHappenedAt !== income.happenedAt;

  if (amount < executedTotal) {
    const allocationTargets = scaleAllocationsWithoutPlan(allocations, income.amountToman, amount);
    return {
      valid: false, issue: "amount_below_executed", executedTotal, dateLocked,
      plannedTotal: normalized.reduce((sum, row) => sum + row.planned, 0), planUpdates: [], allocationTargets,
      ...allocationMutations(allocations, allocationTargets),
    };
  }
  if (dateLocked && dateChanged) {
    const allocationTargets = scaleAllocationsWithoutPlan(allocations, income.amountToman, amount);
    return {
      valid: false, issue: "date_locked_after_execution", executedTotal, dateLocked,
      plannedTotal: normalized.reduce((sum, row) => sum + row.planned, 0), planUpdates: [], allocationTargets,
      ...allocationMutations(allocations, allocationTargets),
    };
  }

  if (normalized.length === 0) {
    const allocationTargets = scaleAllocationsWithoutPlan(allocations, income.amountToman, amount);
    return {
      valid: true, issue: null, executedTotal, dateLocked, plannedTotal: 0, planUpdates: [], allocationTargets,
      ...allocationMutations(allocations, allocationTargets),
    };
  }

  const oldPlannedTotal = normalized.reduce((sum, row) => sum + row.planned, 0);
  const remainingTotal = normalized.reduce((sum, row) => sum + row.remaining, 0);
  const ratio = income.amountToman > 0 ? amount / income.amountToman : 1;
  const scaledTarget = Math.min(amount, Math.max(executedTotal, Math.round(oldPlannedTotal * ratio)));
  const extraTarget = remainingTotal > 0 ? Math.max(0, scaledTarget - executedTotal) : 0;
  const extraShares = distribute(extraTarget, normalized.map((row) => row.remaining));
  const planUpdates = normalized.map((row, index) => ({
    id: row.item.id ?? 0,
    plannedToman: row.executed + extraShares[index],
  })).filter((row) => row.id > 0);
  const plannedById = new Map(planUpdates.map((row) => [row.id, row.plannedToman]));
  const allocationTargets = Object.fromEntries(buckets.map((bucket) => [bucket, normalized
    .filter((row) => row.item.bucket === bucket)
    .reduce((sum, row) => sum + (row.item.id ? plannedById.get(row.item.id) ?? row.executed : row.executed), 0)])) as Record<BucketKey, number>;
  const plannedTotal = buckets.reduce((sum, bucket) => sum + allocationTargets[bucket], 0);

  return {
    valid: true, issue: null, executedTotal, dateLocked, plannedTotal, planUpdates, allocationTargets,
    ...allocationMutations(allocations, allocationTargets),
  };
}

export function incomeCorrectionIssueMessage(issue: IncomeCorrectionIssue, executedTotal: number) {
  if (issue === "date_locked_after_execution") return "بعد از شروع اجرای برنامه، تاریخ پول ورودی قابل جابه‌جایی نیست.";
  return `مبلغ پول ورودی نمی‌تواند از ${new Intl.NumberFormat("fa-IR").format(executedTotal)} تومان اجراشده کمتر باشد.`;
}
