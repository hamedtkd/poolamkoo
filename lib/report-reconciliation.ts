import type { AllocationEntry, FundMovement, IncomeEvent, InvestmentTransaction, PlanItem } from "./types.ts";

export type ReconciliationStatus = "balanced" | "in_progress" | "attention";

export interface IncomeReconciliationRow {
  incomeId?: number;
  title: string;
  happenedAt: string;
  incomeToman: number;
  allocatedToman: number;
  plannedToman: number;
  executedToman: number;
  allocationGapToman: number;
  planningGapToman: number;
  executionRemainingToman: number;
  executionOverrunToman: number;
  executionPct: number;
  status: ReconciliationStatus;
}

export interface ReportReconciliationSnapshot {
  incomeTotal: number;
  allocatedTotal: number;
  plannedTotal: number;
  executedTotal: number;
  allocationGapToman: number;
  unallocatedToman: number;
  overallocatedToman: number;
  planningGapToman: number;
  unplannedToman: number;
  overplannedToman: number;
  executionRemainingToman: number;
  executionOverrunToman: number;
  allocationCoveragePct: number;
  planningCoveragePct: number;
  executionPct: number;
  attentionCount: number;
  rows: IncomeReconciliationRow[];
  funds: {
    deposits: number;
    withdrawals: number;
    opening: number;
    netMovement: number;
  };
  investments: {
    buys: number;
    sells: number;
    netBuyFlow: number;
  };
}

const TOLERANCE_TOMAN = 1;

export function buildReportReconciliation(input: {
  incomes: IncomeEvent[];
  allocations: AllocationEntry[];
  planItems: PlanItem[];
  fundMovements: FundMovement[];
  transactions: InvestmentTransaction[];
}): ReportReconciliationSnapshot {
  const allocationsByIncome = sumByIncome(input.allocations, (row) => row.amountToman);
  const plansByIncome = sumPlanByIncome(input.planItems);
  const rows = input.incomes.map((income) => {
    const incomeToman = safeAmount(income.amountToman);
    const allocatedToman = income.id ? allocationsByIncome.get(income.id) ?? 0 : 0;
    const plan = income.id ? plansByIncome.get(income.id) : undefined;
    const plannedToman = plan?.planned ?? 0;
    const executedToman = plan?.executed ?? 0;
    const allocationGapToman = incomeToman - allocatedToman;
    const planningGapToman = allocatedToman - plannedToman;
    const executionRemainingToman = Math.max(0, plannedToman - executedToman);
    const executionOverrunToman = Math.max(0, executedToman - plannedToman);
    return {
      incomeId: income.id,
      title: income.title || "پول ورودی",
      happenedAt: income.happenedAt,
      incomeToman,
      allocatedToman,
      plannedToman,
      executedToman,
      allocationGapToman,
      planningGapToman,
      executionRemainingToman,
      executionOverrunToman,
      executionPct: ratio(executedToman, plannedToman),
      status: rowStatus(allocationGapToman, planningGapToman, executionRemainingToman, executionOverrunToman),
    } satisfies IncomeReconciliationRow;
  }).sort((a, b) => b.happenedAt.localeCompare(a.happenedAt));

  const incomeTotal = sum(rows, "incomeToman");
  const allocatedTotal = sum(rows, "allocatedToman");
  const plannedTotal = sum(rows, "plannedToman");
  const executedTotal = sum(rows, "executedToman");
  const funds = summarizeFunds(input.fundMovements);
  const investments = summarizeInvestments(input.transactions);

  return {
    incomeTotal,
    allocatedTotal,
    plannedTotal,
    executedTotal,
    allocationGapToman: incomeTotal - allocatedTotal,
    unallocatedToman: rows.reduce((total, row) => total + Math.max(0, row.allocationGapToman), 0),
    overallocatedToman: rows.reduce((total, row) => total + Math.max(0, -row.allocationGapToman), 0),
    planningGapToman: allocatedTotal - plannedTotal,
    unplannedToman: rows.reduce((total, row) => total + Math.max(0, row.planningGapToman), 0),
    overplannedToman: rows.reduce((total, row) => total + Math.max(0, -row.planningGapToman), 0),
    executionRemainingToman: rows.reduce((total, row) => total + row.executionRemainingToman, 0),
    executionOverrunToman: rows.reduce((total, row) => total + row.executionOverrunToman, 0),
    allocationCoveragePct: ratio(allocatedTotal, incomeTotal),
    planningCoveragePct: ratio(plannedTotal, allocatedTotal),
    executionPct: ratio(Math.min(executedTotal, plannedTotal), plannedTotal),
    attentionCount: rows.filter((row) => row.status === "attention").length,
    rows,
    funds,
    investments,
  };
}

function sumByIncome<T extends { incomeId: number }>(rows: T[], amount: (row: T) => number) {
  const result = new Map<number, number>();
  for (const row of rows) result.set(row.incomeId, (result.get(row.incomeId) ?? 0) + safeAmount(amount(row)));
  return result;
}

function sumPlanByIncome(rows: PlanItem[]) {
  const result = new Map<number, { planned: number; executed: number }>();
  for (const row of rows) {
    const current = result.get(row.incomeId) ?? { planned: 0, executed: 0 };
    current.planned += safeAmount(row.plannedToman);
    current.executed += safeAmount(row.executedToman);
    result.set(row.incomeId, current);
  }
  return result;
}

function summarizeFunds(rows: FundMovement[]) {
  let deposits = 0;
  let withdrawals = 0;
  let opening = 0;
  for (const row of rows) {
    const amount = safeAmount(row.amountToman);
    if (row.type === "withdraw") withdrawals += amount;
    else if (row.type === "opening") opening += amount;
    else deposits += amount;
  }
  return { deposits, withdrawals, opening, netMovement: deposits - withdrawals };
}

function summarizeInvestments(rows: InvestmentTransaction[]) {
  let buys = 0;
  let sells = 0;
  for (const row of rows) {
    const amount = safeAmount(row.amountToman);
    if (row.type === "sell") sells += amount;
    else buys += amount;
  }
  return { buys, sells, netBuyFlow: buys - sells };
}

function rowStatus(allocationGap: number, planningGap: number, remaining: number, overrun: number): ReconciliationStatus {
  if (Math.abs(allocationGap) > TOLERANCE_TOMAN || Math.abs(planningGap) > TOLERANCE_TOMAN || overrun > TOLERANCE_TOMAN) return "attention";
  return remaining > TOLERANCE_TOMAN ? "in_progress" : "balanced";
}

function sum(rows: IncomeReconciliationRow[], key: keyof Pick<IncomeReconciliationRow, "incomeToman" | "allocatedToman" | "plannedToman" | "executedToman">) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return finite(Math.min(100, Math.max(0, numerator / denominator * 100)));
}

function safeAmount(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function finite(value: number) {
  return Number.isFinite(value) ? value : 0;
}
