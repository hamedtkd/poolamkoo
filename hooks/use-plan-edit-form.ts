"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { usePlanItemActions } from "@/hooks/use-plan-item-actions";
import type { Asset, GoalFund, IncomeEvent, PlanItem } from "@/lib/types";
import { quickPlanSchema, type QuickPlanFormValues } from "@/lib/validation";

export function usePlanEditForm({
  item,
  open,
  onOpenChange,
  income,
  planItems,
  assets,
  funds,
}: {
  item: PlanItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: IncomeEvent;
  planItems: PlanItem[];
  assets: Asset[];
  funds: GoalFund[];
}) {
  const actions = usePlanItemActions({ income, planItems, assets, funds });
  const form = useForm<QuickPlanFormValues>({
    resolver: zodResolver(quickPlanSchema),
    defaultValues: { label: "", amount: 0, bucket: "growth", targetType: "bucket", targetId: null },
  });
  const bucket = form.watch("bucket");
  const targetType = form.watch("targetType");
  const lockedTarget = (item?.executedToman ?? 0) > 0;
  const maxToman = (item?.plannedToman ?? 0) + actions.availableToman;

  useEffect(() => {
    if (!open || !item) return;
    form.reset({
      label: item.label,
      amount: item.plannedToman,
      bucket: item.bucket,
      targetType: item.targetType === "asset" || item.targetType === "fund" ? item.targetType : "bucket",
      targetId: item.targetId ?? null,
    });
  }, [form, item, open]);

  useEffect(() => {
    if (lockedTarget) return;
    const allowed = bucket === "life" ? ["bucket"] : bucket === "safety" ? ["bucket", "fund"] : ["bucket", "asset"];
    if (!allowed.includes(targetType)) {
      form.setValue("targetType", "bucket");
      form.setValue("targetId", null);
    }
  }, [bucket, form, lockedTarget, targetType]);

  const targetTypeOptions = useMemo(() => {
    if (bucket === "life") return [{ value: "bucket", label: "هدف عمومی" }];
    if (bucket === "safety") return [{ value: "bucket", label: "هدف عمومی" }, { value: "fund", label: "صندوق" }];
    return [{ value: "bucket", label: "هدف عمومی" }, { value: "asset", label: "دارایی سرمایه‌گذاری" }];
  }, [bucket]);

  const targetOptions = targetType === "asset" ? actions.assetOptions : targetType === "fund" ? actions.fundOptions : [];
  const submit = form.handleSubmit(async (values) => {
    if (!item) return;
    try {
      await actions.updatePlanItem(item, values);
      onOpenChange(false);
    } catch (error) {
      form.setError("amount", { message: error instanceof Error ? error.message : "ویرایش کارت برنامه ناموفق بود." });
    }
  });

  return { form, submit, lockedTarget, maxToman, targetTypeOptions, targetOptions };
}
