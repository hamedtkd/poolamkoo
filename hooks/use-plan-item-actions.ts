"use client";

import { useCallback, useMemo } from "react";
import { db } from "@/lib/db";
import { syncIncomeAllocationsFromPlan } from "@/lib/plan-execution";
import type { Asset, GoalFund, IncomeEvent, PlanItem } from "@/lib/types";
import type { QuickPlanFormValues } from "@/lib/validation";

export function usePlanItemActions({
  income,
  planItems,
  assets,
  funds,
}: {
  income?: IncomeEvent;
  planItems?: PlanItem[];
  assets: Asset[];
  funds: GoalFund[];
}) {
  const incomeItems = useMemo(
    () => (planItems ?? []).filter((item) => item.incomeId === income?.id),
    [income?.id, planItems],
  );
  const plannedTotal = useMemo(
    () => incomeItems.reduce((sum, item) => sum + item.plannedToman, 0),
    [incomeItems],
  );
  const availableToman = Math.max(0, (income?.amountToman ?? 0) - plannedTotal);

  const createPlanItem = useCallback(async (values: QuickPlanFormValues) => {
    if (!income?.id) throw new Error("پول ورودی برای ساخت کارت پیدا نشد.");
    const current = await db.planItems.where("incomeId").equals(income.id).toArray();
    const currentTotal = current.reduce((sum, item) => sum + item.plannedToman, 0);
    const available = Math.max(0, income.amountToman - currentTotal);
    const amount = Math.round(values.amount);
    if (amount > available) {
      throw new Error(`حداکثر مبلغ آزاد برای این برنامه ${new Intl.NumberFormat("fa-IR").format(available)} تومان است.`);
    }
    const now = new Date().toISOString();
    await db.planItems.add({
      incomeId: income.id,
      bucket: values.bucket,
      targetType: values.targetType,
      targetId: values.targetType === "bucket" ? undefined : values.targetId ?? undefined,
      label: values.label.trim(),
      plannedToman: amount,
      executedToman: 0,
      createdAt: now,
      updatedAt: now,
    });
    await syncIncomeAllocationsFromPlan(income.id);
  }, [income]);

  const updatePlanItem = useCallback(async (item: PlanItem, values: QuickPlanFormValues) => {
    if (!income?.id || !item.id) throw new Error("کارت برنامه برای ویرایش پیدا نشد.");
    const current = await db.planItems.where("incomeId").equals(income.id).toArray();
    const otherTotal = current.filter((row) => row.id !== item.id).reduce((sum, row) => sum + row.plannedToman, 0);
    const maxAmount = Math.max(0, income.amountToman - otherTotal);
    const amount = Math.round(values.amount);
    if (amount > maxAmount) {
      throw new Error(`حداکثر مبلغ قابل برنامه‌ریزی برای این کارت ${new Intl.NumberFormat("fa-IR").format(maxAmount)} تومان است.`);
    }
    if (amount < item.executedToman) {
      throw new Error(`مبلغ برنامه نمی‌تواند از ${new Intl.NumberFormat("fa-IR").format(item.executedToman)} تومان اجراشده کمتر باشد.`);
    }
    const lockedTarget = item.executedToman > 0;
    await db.planItems.update(item.id, {
      label: values.label.trim(),
      plannedToman: amount,
      bucket: lockedTarget ? item.bucket : values.bucket,
      targetType: lockedTarget ? item.targetType : values.targetType,
      targetId: lockedTarget ? item.targetId : values.targetType === "bucket" ? undefined : values.targetId ?? undefined,
      updatedAt: new Date().toISOString(),
    });
    await syncIncomeAllocationsFromPlan(income.id);
  }, [income]);

  const deletePlanItem = useCallback(async (item: PlanItem) => {
    if (!item.id) return;
    await db.transaction("rw", db.planItems, db.transactions, async () => {
      const linked = await db.transactions.where("planItemId").equals(item.id!).toArray();
      for (const transaction of linked) {
        if (transaction.id) await db.transactions.update(transaction.id, { planItemId: undefined });
      }
      await db.planItems.delete(item.id!);
    });
    await syncIncomeAllocationsFromPlan(item.incomeId);
  }, []);

  const assetOptions = useMemo(
    () => assets.filter((asset) => asset.id && !asset.archived).map((asset) => ({ value: String(asset.id), label: asset.name })),
    [assets],
  );
  const fundOptions = useMemo(
    () => funds.filter((fund) => fund.id).map((fund) => ({ value: String(fund.id), label: fund.name })),
    [funds],
  );

  return { availableToman, createPlanItem, updatePlanItem, deletePlanItem, assetOptions, fundOptions };
}
