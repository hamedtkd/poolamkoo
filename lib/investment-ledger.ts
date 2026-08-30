import type { InvestmentTransaction } from "./types.ts";

const EPSILON = 1e-10;

type LedgerRow = Pick<InvestmentTransaction, "id" | "assetId" | "type" | "quantity" | "happenedAt" | "createdAt">;

export interface InvestmentLedgerViolation {
  assetId: number;
  transactionId?: number;
  happenedAt: string;
  availableQuantity: number;
  requestedQuantity: number;
}

export interface InvestmentLedgerCheck {
  valid: boolean;
  violation?: InvestmentLedgerViolation;
}

export function validateInvestmentLedger(rows: readonly LedgerRow[]): InvestmentLedgerCheck {
  const balances = new Map<number, number>();
  for (const row of [...rows].sort(compareLedgerRows)) {
    const quantity = safeQuantity(row.quantity);
    if (quantity <= 0) continue;
    const balance = balances.get(row.assetId) ?? 0;
    if (row.type === "sell" && quantity > balance + EPSILON) {
      return {
        valid: false,
        violation: {
          assetId: row.assetId,
          transactionId: row.id,
          happenedAt: row.happenedAt,
          availableQuantity: Math.max(0, balance),
          requestedQuantity: quantity,
        },
      };
    }
    balances.set(row.assetId, Math.max(0, balance + (row.type === "buy" ? quantity : -quantity)));
  }
  return { valid: true };
}

export function validateTransactionChange(
  rows: readonly LedgerRow[],
  candidate: LedgerRow,
  replacingId?: number,
): InvestmentLedgerCheck {
  const next = rows.filter((row) => row.id !== replacingId);
  next.push(candidate);
  return validateInvestmentLedger(next);
}

export function availableQuantityOnDate(
  rows: readonly LedgerRow[],
  assetId: number,
  happenedAt: string,
  replacingId?: number,
) {
  let quantity = 0;
  for (const row of rows) {
    if (row.id === replacingId || row.assetId !== assetId || row.happenedAt.slice(0, 10) > happenedAt.slice(0, 10)) continue;
    const value = safeQuantity(row.quantity);
    quantity += row.type === "buy" ? value : -value;
  }
  return Math.max(0, quantity);
}

export function investmentLedgerErrorMessage(check: InvestmentLedgerCheck) {
  if (check.valid || !check.violation) return null;
  return "این تغییر باعث می‌شود در یکی از تاریخ‌های ثبت‌شده، مقدار فروش از موجودی واقعی همان زمان بیشتر شود. تاریخ، مبلغ یا مقدار معامله را اصلاح کن.";
}

function compareLedgerRows(a: LedgerRow, b: LedgerRow) {
  const date = a.happenedAt.slice(0, 10).localeCompare(b.happenedAt.slice(0, 10));
  if (date) return date;
  if (a.type !== b.type) return a.type === "buy" ? -1 : 1;
  const created = a.createdAt.localeCompare(b.createdAt);
  if (created) return created;
  return (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER);
}

function safeQuantity(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
