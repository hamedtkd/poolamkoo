"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { db } from "@/lib/db";
import { dateToISO, isoToDate } from "@/lib/format";
import { incomeCorrectionIssueMessage, reviewIncomeCorrection } from "@/lib/income-correction";
import { createRecoverySnapshot } from "@/lib/recovery";
import type { IncomeEvent, PlanItem } from "@/lib/types";
import { incomeEditSchema, type IncomeEditFormValues } from "@/lib/validation";

export function useIncomeEditor(editing: IncomeEvent | null, planItems: PlanItem[], onSaved: () => void) {
  const form = useForm<IncomeEditFormValues>({ resolver: zodResolver(incomeEditSchema), defaultValues: { amount: undefined, title: "", date: new Date() }, mode: "onBlur" });
  const incomePlans = useMemo(() => planItems.filter((row) => row.incomeId === editing?.id), [editing?.id, planItems]);
  const recordedExecuted = useMemo(() => incomePlans.reduce((sum, item) => sum + Math.max(0, Number.isFinite(item.executedToman) ? item.executedToman : 0), 0), [incomePlans]);
  const dateLocked = recordedExecuted > 0;

  useEffect(() => {
    if (!editing) return;
    form.reset({ amount: editing.amountToman, title: editing.title, date: isoToDate(editing.happenedAt) ?? new Date() });
  }, [editing, form]);

  const save = form.handleSubmit(async (values) => {
    if (!editing?.id) return;
    form.clearErrors("root.integrity");
    const nextHappenedAt = dateToISO(values.date);
    try {
      const currentPlans = await db.planItems.where("incomeId").equals(editing.id).toArray();
      const currentAllocations = await db.allocations.where("incomeId").equals(editing.id).toArray();
      const linkedTransactions = await db.transactions.where("incomeId").equals(editing.id).toArray();
      const review = reviewIncomeCorrection({
        income: editing, nextAmountToman: values.amount, nextHappenedAt,
        planItems: currentPlans, allocations: currentAllocations, linkedTransactions,
      });
      if (!review.valid && review.issue) {
        form.setError("root.integrity", { message: incomeCorrectionIssueMessage(review.issue, review.executedTotal) });
        return;
      }

      await createRecoverySnapshot("قبل از اصلاح پول ورودی");
      await db.transaction("rw", [db.incomes, db.allocations, db.planItems, db.transactions], async () => {
        const liveIncome = await db.incomes.get(editing.id!);
        if (!liveIncome) throw new Error("پول ورودی پیدا نشد.");
        const livePlans = await db.planItems.where("incomeId").equals(editing.id!).toArray();
        const liveAllocations = await db.allocations.where("incomeId").equals(editing.id!).toArray();
        const liveTransactions = await db.transactions.where("incomeId").equals(editing.id!).toArray();
        const liveReview = reviewIncomeCorrection({
          income: liveIncome, nextAmountToman: values.amount, nextHappenedAt,
          planItems: livePlans, allocations: liveAllocations, linkedTransactions: liveTransactions,
        });
        if (!liveReview.valid && liveReview.issue) throw new Error(incomeCorrectionIssueMessage(liveReview.issue, liveReview.executedTotal));
        const now = new Date().toISOString();
        await db.incomes.update(editing.id!, { amountToman: Math.round(values.amount), title: values.title.trim(), happenedAt: nextHappenedAt });
        for (const update of liveReview.planUpdates) await db.planItems.update(update.id, { plannedToman: update.plannedToman, updatedAt: now });
        for (const update of liveReview.allocationUpdates) await db.allocations.update(update.id, { amountToman: update.amountToman });
        for (const row of liveReview.allocationAdds) await db.allocations.add({ incomeId: editing.id!, bucket: row.bucket, amountToman: row.amountToman, createdAt: now });
      });
      onSaved();
    } catch (error) {
      form.setError("root.integrity", { message: error instanceof Error ? error.message : "اصلاح پول ورودی انجام نشد." });
    }
  });

  return { form, save, dateLocked, recordedExecuted };
}
