import type { FundMovement, FundMovementSource, FundMovementType, GoalFund } from "./types.ts";

const EPSILON = 0.5;

function safeAmount(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function dayKey(value: string) {
  return value.slice(0, 10);
}

function movementPriority(type: FundMovementType) {
  return type === "withdraw" ? 1 : 0;
}


export function fundMovementSourceTypeIsValid(type: FundMovementType, source: FundMovementSource) {
  if (type === "opening") return source === "opening" || source === "migration";
  if (source === "opening" || source === "migration") return false;
  if (source === "plan" || source === "direct") return type === "deposit";
  if (source === "income_reversal") return type === "withdraw";
  return source === "manual";
}

export function fundMovementDelta(movement: Pick<FundMovement, "type" | "amountToman">) {
  const amount = safeAmount(movement.amountToman);
  return movement.type === "withdraw" ? -amount : amount;
}

export function sortFundMovements<T extends Pick<FundMovement, "type" | "happenedAt" | "createdAt" | "id">>(rows: T[]) {
  return [...rows].sort((a, b) => {
    const date = dayKey(a.happenedAt).localeCompare(dayKey(b.happenedAt));
    if (date) return date;
    const priority = movementPriority(a.type) - movementPriority(b.type);
    if (priority) return priority;
    const created = a.createdAt.localeCompare(b.createdAt);
    if (created) return created;
    return (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER);
  });
}

export function reviewFundLedger(rows: FundMovement[]) {
  let balance = 0;
  let negativeAt: FundMovement | null = null;
  for (const movement of sortFundMovements(rows)) {
    balance += fundMovementDelta(movement);
    if (balance < -EPSILON) {
      negativeAt = movement;
      break;
    }
  }
  return { valid: !negativeAt, balance: Math.max(0, balance), negativeAt };
}

export function fundLedgerAfterUpsert(rows: FundMovement[], next: FundMovement) {
  const withoutOriginal = next.id ? rows.filter((row) => row.id !== next.id) : rows;
  return reviewFundLedger([...withoutOriginal, next]);
}

export function fundLedgerAfterDelete(rows: FundMovement[], movementId: number) {
  return reviewFundLedger(rows.filter((row) => row.id !== movementId));
}

export function fundMovementCanEdit(movement: Pick<FundMovement, "source">) {
  return movement.source === "manual";
}

export function legacyFundOpeningMovement(fund: GoalFund, source: FundMovementSource = "migration"): FundMovement | null {
  if (!fund.id || safeAmount(fund.currentToman) <= 0) return null;
  const createdAt = fund.updatedAt || fund.createdAt || new Date(0).toISOString();
  return {
    fundId: fund.id,
    type: "opening",
    source,
    amountToman: safeAmount(fund.currentToman),
    happenedAt: createdAt.slice(0, 10),
    note: source === "migration" ? "موجودی ثبت‌شده پیش از دفتر گردش صندوق" : "موجودی آغازین صندوق",
    createdAt,
    updatedAt: createdAt,
  };
}

export function assertPortableFundLedger(data: Record<string, unknown>) {
  const funds = Array.isArray(data.funds) ? data.funds as GoalFund[] : [];
  if (!Array.isArray(data.fundMovements)) return;
  const movements = data.fundMovements as FundMovement[];
  const fundIds = new Set(funds.map((fund) => fund.id).filter((id): id is number => Number.isInteger(id)));
  const allowedTypes = new Set<FundMovementType>(["deposit", "withdraw", "opening"]);
  const allowedSources = new Set<FundMovementSource>(["manual", "opening", "plan", "direct", "income_reversal", "migration"]);
  for (const row of movements) {
    if (!row || !Number.isInteger(row.fundId) || !fundIds.has(row.fundId)) throw new Error("گردش صندوق به صندوق معتبری متصل نیست.");
    if (!allowedTypes.has(row.type) || !allowedSources.has(row.source) || !fundMovementSourceTypeIsValid(row.type, row.source)) throw new Error("نوع یا منبع گردش صندوق معتبر نیست.");
    if (safeAmount(row.amountToman) <= 0 || typeof row.happenedAt !== "string" || typeof row.createdAt !== "string") throw new Error("گردش صندوق داده معتبر ندارد.");
  }
  for (const fund of funds) {
    if (!fund.id) continue;
    const rows = movements.filter((row) => row.fundId === fund.id);
    if (!rows.length) continue;
    const review = reviewFundLedger(rows);
    if (!review.valid) throw new Error("تاریخچه گردش صندوق باعث موجودی منفی می‌شود.");
    if (Math.abs(review.balance - safeAmount(fund.currentToman)) > EPSILON) throw new Error("موجودی صندوق با دفتر گردش آن همخوان نیست.");
  }
}

export function normalizePortableFundLedger(data: Record<string, unknown>): Record<string, unknown> {
  const funds = Array.isArray(data.funds) ? data.funds as GoalFund[] : [];
  const existing = Array.isArray(data.fundMovements) ? data.fundMovements as FundMovement[] : [];
  const byFund = new Map<number, FundMovement[]>();
  for (const row of existing) {
    const rows = byFund.get(row.fundId) ?? [];
    rows.push(row);
    byFund.set(row.fundId, rows);
  }
  const movements = [...existing];
  for (const fund of funds) {
    if (!fund.id || byFund.has(fund.id)) continue;
    const opening = legacyFundOpeningMovement(fund);
    if (opening) movements.push(opening);
  }
  const normalized: Record<string, unknown> = { ...data };
  normalized.fundMovements = movements;
  return normalized;
}
