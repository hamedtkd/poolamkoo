"use client";

import { db } from "@/lib/db";
import { fundLedgerAfterDelete, fundLedgerAfterUpsert, fundMovementCanEdit, fundMovementSourceTypeIsValid, reviewFundLedger } from "@/lib/fund-ledger";
import type { FundMovement, FundMovementSource, FundMovementType } from "@/lib/types";

export type FundMovementInput = {
  fundId: number;
  type: FundMovementType;
  source: FundMovementSource;
  amountToman: number;
  happenedAt: string;
  note?: string;
};

function movementError() {
  return new Error("این تغییر باعث می‌شود موجودی صندوق در بخشی از تاریخ منفی شود.");
}

export async function applyFundMovementWithinTransaction(input: FundMovementInput) {
  const fund = await db.funds.get(input.fundId);
  if (!fund?.id) throw new Error("صندوق پیدا نشد.");
  const now = new Date().toISOString();
  if (!fundMovementSourceTypeIsValid(input.type, input.source)) throw new Error("نوع گردش صندوق با منبع آن همخوان نیست.");
  const row: FundMovement = {
    fundId: fund.id,
    type: input.type,
    source: input.source,
    amountToman: Math.round(input.amountToman),
    happenedAt: input.happenedAt,
    note: input.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  const existing = await db.fundMovements.where("fundId").equals(fund.id).toArray();
  const review = fundLedgerAfterUpsert(existing, row);
  if (!review.valid || row.amountToman <= 0) throw movementError();
  const id = await db.fundMovements.add(row);
  await db.funds.update(fund.id, { currentToman: review.balance, updatedAt: now });
  return { ...row, id: Number(id) };
}

export async function recordFundMovement(input: FundMovementInput) {
  return db.transaction("rw", db.funds, db.fundMovements, () => applyFundMovementWithinTransaction(input));
}

export async function updateManualFundMovement(movement: FundMovement, patch: Pick<FundMovementInput, "type" | "amountToman" | "happenedAt" | "note">) {
  if (!movement.id || !fundMovementCanEdit(movement)) throw new Error("فقط گردش‌های دستی قابل ویرایش‌اند.");
  return db.transaction("rw", db.funds, db.fundMovements, async () => {
    const rows = await db.fundMovements.where("fundId").equals(movement.fundId).toArray();
    const now = new Date().toISOString();
    const next: FundMovement = { ...movement, ...patch, amountToman: Math.round(patch.amountToman), note: patch.note?.trim() || undefined, updatedAt: now };
    const review = fundLedgerAfterUpsert(rows, next);
    if (!review.valid || next.amountToman <= 0) throw movementError();
    await db.fundMovements.update(movement.id, next);
    await db.funds.update(movement.fundId, { currentToman: review.balance, updatedAt: now });
    return next;
  });
}

export async function deleteManualFundMovement(movement: FundMovement) {
  if (!movement.id || !fundMovementCanEdit(movement)) throw new Error("فقط گردش‌های دستی قابل حذف‌اند.");
  return db.transaction("rw", db.funds, db.fundMovements, async () => {
    const rows = await db.fundMovements.where("fundId").equals(movement.fundId).toArray();
    const review = fundLedgerAfterDelete(rows, movement.id!);
    if (!review.valid) throw movementError();
    await db.fundMovements.delete(movement.id!);
    await db.funds.update(movement.fundId, { currentToman: review.balance, updatedAt: new Date().toISOString() });
  });
}

export async function resyncFundBalance(fundId: number) {
  const rows = await db.fundMovements.where("fundId").equals(fundId).toArray();
  const review = reviewFundLedger(rows);
  if (!review.valid) throw movementError();
  await db.funds.update(fundId, { currentToman: review.balance, updatedAt: new Date().toISOString() });
  return review.balance;
}
