"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { db } from "@/lib/db";
import { dateToISO, isoToDate } from "@/lib/format";
import type { AllocationEntry, IncomeEvent, PlanItem } from "@/lib/types";
import { incomeEditSchema, type IncomeEditFormValues } from "@/lib/validation";

export function useIncomeEditor(editing: IncomeEvent | null, allocations: AllocationEntry[], planItems: PlanItem[], onSaved: () => void) {
  const form = useForm<IncomeEditFormValues>({ resolver: zodResolver(incomeEditSchema), defaultValues: { amount: undefined, title: "", date: new Date() }, mode: "onBlur" });

  useEffect(() => {
    if (!editing) return;
    form.reset({ amount: editing.amountToman, title: editing.title, date: isoToDate(editing.happenedAt) ?? new Date() });
  }, [editing, form]);

  const save = form.handleSubmit(async (values) => {
    if (!editing?.id) return;
    const ratio = values.amount / Math.max(1, editing.amountToman);
    await db.transaction("rw", db.incomes, db.allocations, db.planItems, async () => {
      await db.incomes.update(editing.id!, { amountToman: values.amount, title: values.title.trim(), happenedAt: dateToISO(values.date) });
      for (const row of allocations.filter((item) => item.incomeId === editing.id)) {
        if (row.id) await db.allocations.update(row.id, { amountToman: Math.round(row.amountToman * ratio) });
      }
      for (const item of planItems.filter((row) => row.incomeId === editing.id)) {
        if (!item.id) continue;
        const plannedToman = Math.max(item.executedToman, Math.round(item.plannedToman * ratio));
        await db.planItems.update(item.id, { plannedToman, updatedAt: new Date().toISOString() });
      }
    });
    onSaved();
  });

  return { form, save };
}
