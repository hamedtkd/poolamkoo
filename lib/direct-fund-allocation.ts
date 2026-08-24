import type { GoalFund } from "@/lib/types";

export interface DirectFundAllocation {
  id: string;
  fundId?: number;
  amountToman: number;
}

export function directFundTotal(rows: DirectFundAllocation[]) {
  return rows.reduce((sum, row) => sum + safePositive(row.amountToman), 0);
}

export function remainingAfterDirect(amountToman: number, rows: DirectFundAllocation[]) {
  return Math.max(0, safePositive(amountToman) - directFundTotal(rows));
}

export function fundsWithDirectBalances(funds: GoalFund[], rows: DirectFundAllocation[]) {
  const byFund = new Map<number, number>();
  for (const row of rows) {
    if (!row.fundId) continue;
    byFund.set(row.fundId, (byFund.get(row.fundId) ?? 0) + safePositive(row.amountToman));
  }
  return funds.map((fund) => fund.id
    ? { ...fund, currentToman: safePositive(fund.currentToman) + (byFund.get(fund.id) ?? 0) }
    : fund);
}

export function validateDirectFundAllocations(amountToman: number, rows: DirectFundAllocation[], funds: GoalFund[]) {
  const amount = safePositive(amountToman);
  const total = directFundTotal(rows);
  if (total > amount) return "مبلغ کنارگذاشته‌شده نمی‌تواند از کل پول جدید بیشتر باشد.";

  const knownFunds = new Set(funds.flatMap((fund) => typeof fund.id === "number" ? [fund.id] : []));
  for (const row of rows) {
    if (safePositive(row.amountToman) <= 0) continue;
    if (!row.fundId || !knownFunds.has(row.fundId)) return "برای هر مبلغ مستقیم یک صندوق معتبر انتخاب کن.";
  }
  return "";
}

function safePositive(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}
