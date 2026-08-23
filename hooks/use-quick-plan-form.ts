"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { usePlanItemActions } from "@/hooks/use-plan-item-actions";
import type { Asset, GoalFund, IncomeEvent, PlanItem } from "@/lib/types";
import { quickPlanSchema, type QuickPlanFormValues } from "@/lib/validation";

export function useQuickPlanForm({
  open,
  onOpenChange,
  income,
  planItems,
  assets,
  funds,
  initialBucket = "growth",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: IncomeEvent;
  planItems: PlanItem[];
  assets: Asset[];
  funds: GoalFund[];
  initialBucket?: "life" | "safety" | "growth";
}) {
  const actions = usePlanItemActions({ income, planItems, assets, funds });
  const form = useForm<QuickPlanFormValues>({
    resolver: zodResolver(quickPlanSchema),
    defaultValues: { label: "برنامه جدید", amount: 0, bucket: "growth", targetType: "bucket", targetId: null },
  });
  const bucket = form.watch("bucket");
  const targetType = form.watch("targetType");

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: "برنامه جدید",
      amount: actions.availableToman,
      bucket: initialBucket,
      targetType: "bucket",
      targetId: null,
    });
  }, [actions.availableToman, form, initialBucket, open]);

  useEffect(() => {
    const allowed = bucket === "life" ? ["bucket"] : bucket === "safety" ? ["bucket", "fund"] : ["bucket", "asset"];
    if (!allowed.includes(targetType)) {
      form.setValue("targetType", "bucket");
      form.setValue("targetId", null);
    }
  }, [bucket, form, targetType]);

  const targetTypeOptions = useMemo(() => {
    if (bucket === "life") return [{ value: "bucket", label: "هدف عمومی" }];
    if (bucket === "safety") return [{ value: "bucket", label: "هدف عمومی" }, { value: "fund", label: "صندوق" }];
    return [{ value: "bucket", label: "هدف عمومی" }, { value: "asset", label: "دارایی سرمایه‌گذاری" }];
  }, [bucket]);

  const targetOptions = targetType === "asset" ? actions.assetOptions : targetType === "fund" ? actions.fundOptions : [];

  const submit = form.handleSubmit(async (values) => {
    try {
      await actions.createPlanItem(values);
      onOpenChange(false);
    } catch (error) {
      form.setError("amount", { message: error instanceof Error ? error.message : "ساخت کارت برنامه ناموفق بود." });
    }
  });

  return { form, submit, availableToman: actions.availableToman, targetTypeOptions, targetOptions };
}
