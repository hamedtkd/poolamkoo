export type LoanAllocationMode = "percent" | "amount";

export type LoanAllocationRow = {
  key: string;
  label: string;
  percent: number;
  amountToman: number;
};

export function buildLoanAllocation(totalToman: number, rows: Array<{ key: string; label: string; percent?: number; amountToman?: number }>, mode: LoanAllocationMode): LoanAllocationRow[] {
  const total = Math.max(0, Number(totalToman) || 0);
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    percent: mode === "percent" ? clamp(row.percent ?? 0) : total > 0 ? ((row.amountToman ?? 0) / total) * 100 : 0,
    amountToman: mode === "percent" ? Math.round((total * clamp(row.percent ?? 0)) / 100) : Math.max(0, Math.round(row.amountToman ?? 0)),
  }));
}

export function normalizeAllocationPercent(rows: Array<{ percent: number }>) {
  const sum = rows.reduce((a, b) => a + clamp(b.percent), 0);
  if (!sum) return rows.map(() => 0);
  return rows.map((row) => (clamp(row.percent) / sum) * 100);
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}
