"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { splitIncome } from "@/lib/calculations";
import { db } from "@/lib/db";
import { dateToISO } from "@/lib/format";
import { buildGrowthPlan, buildSafetyPlan } from "@/lib/planning";
import type { AllocationRule, AppSettings, Asset, BucketKey, GoalFund, InvestmentTransaction, MarketQuote, PlanItem } from "@/lib/types";
import { allocationRuleSchema, newMoneySchema, type AllocationRuleFormValues, type NewMoneyFormValues } from "@/lib/validation";

const fallbackRule: AllocationRule = {
  name: "متعادل", preset: "balanced", lifePct: 30, safetyPct: 20, growthPct: 50,
  isActive: true, createdAt: "", updatedAt: "",
};

function toFormRule(rule: AllocationRule): AllocationRuleFormValues {
  return { life: rule.lifePct, safety: rule.safetyPct, growth: rule.growthPct };
}

function rebalanceAllocation(current: AllocationRuleFormValues, bucket: BucketKey, requested: number) {
  const next = { ...current };
  const key = bucket === "life" ? "life" : bucket === "safety" ? "safety" : "growth";
  const target = Math.max(0, Math.min(100, Math.round(requested)));
  const delta = target - next[key];
  if (!delta) return next;

  next[key] = target;
  let remaining = Math.abs(delta);
  const priorities: Array<keyof AllocationRuleFormValues> = key === "growth"
    ? ["life", "safety"]
    : ["growth", key === "life" ? "safety" : "life"];

  for (const other of priorities) {
    if (remaining <= 0) break;
    const capacity = delta > 0 ? next[other] : 100 - next[other];
    const shift = Math.min(remaining, capacity);
    next[other] += delta > 0 ? -shift : shift;
    remaining -= shift;
  }
  if (remaining > 0) next[key] += delta > 0 ? -remaining : remaining;
  return next;
}

export function useNewMoney({ open, rule, settings, funds, assets, transactions, quotes, onSaved }: {
  open: boolean;
  rule?: AllocationRule;
  settings: AppSettings;
  funds: GoalFund[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
  onSaved: (incomeId: number) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const form = useForm<NewMoneyFormValues>({
    resolver: zodResolver(newMoneySchema),
    defaultValues: { amount: undefined, title: "پول جدید", date: new Date(), smart: true },
    mode: "onBlur",
  });
  const allocationForm = useForm<AllocationRuleFormValues>({
    resolver: zodResolver(allocationRuleSchema),
    defaultValues: toFormRule(fallbackRule),
    mode: "onChange",
  });
  const values = form.watch();
  const activeRule = rule ?? fallbackRule;
  const watchedAllocation = allocationForm.watch();
  const allocationValues: AllocationRuleFormValues = {
    life: watchedAllocation.life ?? activeRule.lifePct,
    safety: watchedAllocation.safety ?? activeRule.safetyPct,
    growth: watchedAllocation.growth ?? activeRule.growthPct,
  };
  const emergency = funds.find((fund) => fund.category === "emergency");

  useEffect(() => {
    if (!open) return;
    form.reset({ amount: undefined, title: "پول جدید", date: new Date(), smart: true });
    allocationForm.reset(toFormRule(activeRule));
    setStep(1);
  }, [activeRule, allocationForm, form, open]);

  const effectiveRule = useMemo(() => {
    if (!values.smart || !emergency || emergency.currentToman >= emergency.targetToman) return activeRule;
    const bonus = settings.incomeStability === "irregular" ? 15 : settings.incomeStability === "variable" ? 10 : 5;
    const actual = Math.min(bonus, activeRule.growthPct);
    return { ...activeRule, safetyPct: activeRule.safetyPct + actual, growthPct: activeRule.growthPct - actual };
  }, [activeRule, emergency, settings.incomeStability, values.smart]);

  const eventRule = useMemo<AllocationRule>(() => ({
    ...effectiveRule,
    lifePct: allocationValues.life,
    safetyPct: allocationValues.safety,
    growthPct: allocationValues.growth,
  }), [allocationValues.growth, allocationValues.life, allocationValues.safety, effectiveRule]);

  const amount = Number(values.amount) || 0;
  const split = useMemo(() => splitIncome(amount, eventRule), [amount, eventRule]);
  const safetyPlan = useMemo(() => buildSafetyPlan(split.safety, funds), [funds, split.safety]);
  const growthPlan = useMemo(() => buildGrowthPlan(split.growth, assets, transactions, quotes), [assets, quotes, split.growth, transactions]);
  const smartChanged = effectiveRule.safetyPct !== activeRule.safetyPct;
  const allocationChanged = allocationValues.life !== effectiveRule.lifePct
    || allocationValues.safety !== effectiveRule.safetyPct
    || allocationValues.growth !== effectiveRule.growthPct;

  async function next() {
    const valid = await form.trigger(["amount", "title", "date"]);
    if (!valid) return;
    allocationForm.reset(toFormRule(effectiveRule));
    setStep(2);
  }

  function updateAllocation(bucket: BucketKey, value: number) {
    const nextValues = rebalanceAllocation(allocationForm.getValues(), bucket, value);
    allocationForm.reset(nextValues, { keepDirty: true, keepTouched: true });
  }

  function resetAllocation() {
    allocationForm.reset(toFormRule(effectiveRule));
  }

  async function save() {
    const [moneyValid, allocationValid] = await Promise.all([form.trigger(), allocationForm.trigger()]);
    if (!moneyValid || !allocationValid) return;
    const data = newMoneySchema.parse(form.getValues());
    const allocation = splitIncome(data.amount, eventRule);
    const lifeAmount = Number(allocation.life ?? 0);
    const safetyAmount = Number(allocation.safety ?? 0);
    const growthAmount = Number(allocation.growth ?? 0);
    const fundPlan = buildSafetyPlan(safetyAmount, funds);
    const assetPlan = buildGrowthPlan(growthAmount, assets, transactions, quotes);
    const now = new Date().toISOString();

    let savedIncomeId: number | undefined;
    await db.transaction("rw", db.incomes, db.allocations, db.planItems, async () => {
      const incomeIdKey = await db.incomes.add({
        amountToman: data.amount,
        title: data.title.trim(),
        happenedAt: dateToISO(data.date),
        createdAt: now,
      });
      if (typeof incomeIdKey !== "number") throw new Error("ثبت پول ورودی انجام نشد. دوباره تلاش کنید.");
      const incomeId = incomeIdKey;
      savedIncomeId = incomeId;

      await db.allocations.bulkAdd([
        { incomeId, bucket: "life", amountToman: lifeAmount, createdAt: now },
        { incomeId, bucket: "safety", amountToman: safetyAmount, createdAt: now },
        { incomeId, bucket: "growth", amountToman: growthAmount, createdAt: now },
      ]);

      const plans: PlanItem[] = [];
      if (lifeAmount > 0) {
        plans.push({ incomeId, bucket: "life", targetType: "life", label: "زندگی این دوره", plannedToman: lifeAmount, executedToman: 0, createdAt: now, updatedAt: now });
      }
      let safetyAssigned = 0;
      for (const item of fundPlan) {
        if (item.amountToman <= 0) continue;
        safetyAssigned += item.amountToman;
        const fundId = typeof item.fund.id === "number" ? item.fund.id : undefined;
        plans.push({ incomeId, bucket: "safety", targetType: fundId ? "fund" : "bucket", targetId: fundId, label: item.fund.name, plannedToman: item.amountToman, executedToman: 0, createdAt: now, updatedAt: now });
      }
      if (safetyAmount - safetyAssigned > 0) {
        plans.push({ incomeId, bucket: "safety", targetType: "bucket", label: "امنیت و پس‌انداز", plannedToman: safetyAmount - safetyAssigned, executedToman: 0, createdAt: now, updatedAt: now });
      }
      let growthAssigned = 0;
      for (const item of assetPlan) {
        if (typeof item.asset.id !== "number" || item.amountToman <= 0) continue;
        growthAssigned += item.amountToman;
        plans.push({ incomeId, bucket: "growth", targetType: "asset", targetId: item.asset.id, label: item.asset.name, plannedToman: item.amountToman, executedToman: 0, createdAt: now, updatedAt: now });
      }
      if (growthAmount - growthAssigned > 0) {
        plans.push({ incomeId, bucket: "growth", targetType: "bucket", label: "رشد و سرمایه‌گذاری", plannedToman: growthAmount - growthAssigned, executedToman: 0, createdAt: now, updatedAt: now });
      }
      if (plans.length) await db.planItems.bulkAdd(plans);
    });
    if (savedIncomeId !== undefined) onSaved(savedIncomeId);
  }

  return {
    form, values, step, setStep, activeRule, effectiveRule, eventRule, split, safetyPlan, growthPlan,
    smartChanged, allocationValues, allocationChanged, updateAllocation, resetAllocation, next, save,
  };
}
