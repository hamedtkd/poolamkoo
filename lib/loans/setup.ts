"use client";

import { db } from "../db";
import type { FundMovement, GoalFund, Loan } from "../types";
import { loanContractInstallment, loanReserveTarget } from "./calculations";
import { DEFAULT_LOAN_REMINDER_DAYS, normalizeLoanRecord } from "./validation";
import type { LoanDraft } from "./store";

export type ReserveSetup =
  | { mode: "none" }
  | { mode: "existing"; fundId: number }
  | { mode: "new"; name?: string; initialDepositToman?: number };

export async function createLoanSetup(input: LoanDraft, reserve: ReserveSetup) {
  const now = new Date().toISOString();
  const base = normalizeLoanRecord({
    ...input,
    reserveFundId: reserve.mode === "existing" ? reserve.fundId : undefined,
    reminderDays: input.reminderDays ?? [...DEFAULT_LOAN_REMINDER_DAYS],
    notifyBrowser: input.notifyBrowser ?? false,
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  });

  return db.transaction("rw", db.loans, db.funds, db.fundMovements, async () => {
    let reserveFundId = base.reserveFundId;
    if (reserve.mode === "existing") {
      const existingFund = await db.funds.get(reserve.fundId);
      if (!existingFund) throw new Error("صندوق ذخیره انتخاب‌شده پیدا نشد.");
      if (existingFund.currentToman > 0.5) {
        throw new Error("برای محاسبه دقیق اثر وام، فقط صندوق خالی را به‌عنوان ذخیره موجود متصل کن.");
      }
    }
    if (reserve.mode === "new") {
      const targetToman = loanReserveTarget(loanContractInstallment(base), base.reserveTargetMonths);
      const fund: GoalFund = {
        name: reserve.name?.trim() || `ذخیره اقساط ${base.name}`,
        targetToman,
        currentToman: 0,
        icon: "shield",
        category: "custom",
        createdAt: now,
        updatedAt: now,
      };
      reserveFundId = Number(await db.funds.add(fund));
    }

    const loan: Loan = { ...base, reserveFundId };
    const loanId = Number(await db.loans.add(loan));
    if (reserve.mode === "new" && reserveFundId) {
      const target = loanReserveTarget(loanContractInstallment(loan), loan.reserveTargetMonths);
      const amount = Math.max(0, Math.min(reserve.initialDepositToman ?? target, loan.principalToman));
      if (amount > 0) {
        const movement: FundMovement = {
          fundId: reserveFundId,
          type: "deposit",
          source: "loan_reserve",
          amountToman: Math.round(amount),
          happenedAt: loan.disbursedAt.slice(0, 10),
          note: `ذخیره اولیه از وام ${loan.name}`,
          loanId,
          createdAt: now,
          updatedAt: now,
        };
        await db.fundMovements.add(movement);
        await db.funds.update(reserveFundId, { currentToman: Math.round(amount), updatedAt: now });
      }
    }
    return { loanId, reserveFundId };
  });
}
