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
  const allocationValues = allocationForm.watch();
  const activeRule = rule ?? fallbackRule;
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
    const data = form.getValues();
    const allocation = splitIncome(data.amount, eventRule);
    const fundPlan = buildSafetyPlan(allocation.safety, funds);
    const assetPlan = buildGrowthPlan(allocation.growth, assets, transactions, quotes);
    const now = new Date().toISOString();

    await db.transaction("rw", db.incomes, db.allocations, db.planItems, async () => {
      const incomeId = await db.incomes.add({
        amountToman: data.amount,
        title: data.title.trim(),
        happenedAt: dateToISO(data.date),
        createdAt: now,
      });
      await db.allocations.bulkAdd([
        { incomeId, bucket: "life", amountToman: allocation.life, createdAt: now },
        { incomeId, bucket: "safety", amountToman: allocation.safety, createdAt: now },
        { incomeId, bucket: "growth", amountToman: allocation.growth, createdAt: now },
      ]);

      const plans: PlanItem[] = [];
      if (allocation.life > 0) {
        plans.push({ incomeId, bucket: "life" as const, targetType: "life" as const, label: "\u0632\u0646\u062f\u06af\u06cc \u0627\u06cc\u0646 \u062f\u0648\u0631\u0647", plannedToman: allocation.life, executedToman: 0, createdAt: now, updatedAt: now });
      }
      let safetyAssigned = 0;
      for (const item of fundPlan) {
        if (item.amountToman <= 0) continue;
        safetyAssigned += item.amountToman;
        plans.push({ incomeId, bucket: "safety" as const, targetType: item.fund.id ? "fund" as const : "bucket" as const, targetId: item.fund.id, label: item.fund.name, plannedToman: item.amountToman, executedToman: 0, createdAt: now, updatedAt: now });
      }
      if (allocation.safety - safetyAssigned > 0) {
        plans.push({ incomeId, bucket: "safety" as const, targetType: "bucket" as const, label: "\u0627\u0645\u0646\u06cc\u062a \u0648 \u067e\u0633\u200c\u0627\u0646\u062f\u0627\u0632", plannedToman: allocation.safety - safetyAssigned, executedToman: 0, createdAt: now, updatedAt: now });
      }
      let growthAssigned = 0;
      for (const item of assetPlan) {
        if (!item.asset.id || item.amountToman <= 0) continue;
        growthAssigned += item.amountToman;
        plans.push({ incomeId, bucket: "growth" as const, targetType: "asset" as const, targetId: item.asset.id, label: item.asset.name, plannedToman: item.amountToman, executedToman: 0, createdAt: now, updatedAt: now });
      }
      if (allocation.growth - growthAssigned > 0) {
        plans.push({ incomeId, bucket: "growth" as const, targetType: "bucket" as const, label: "\u0631\u0634\u062f \u0648 \u0633\u0631\u0645\u0627\u06cc\u0647\u200c\u06af\u0630\u0627\u0631\u06cc", plannedToman: allocation.growth - growthAssigned, executedToman: 0, createdAt: now, updatedAt: now });
      }
      if (plans.length) await db.planItems.bulkAdd(plans);
    });
    onSaved(incomeId);
  }

  return {
    form, values, step, setStep, activeRule, effectiveRule, eventRule, split, safetyPlan, growthPlan,
    smartChanged, allocationValues, allocationChanged, updateAllocation, resetAllocation, next, save,
  };
}
