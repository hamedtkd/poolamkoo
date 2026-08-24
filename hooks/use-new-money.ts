"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { splitIncome } from "@/lib/calculations";
import { db } from "@/lib/db";
import {
  directFundTotal,
  fundsWithDirectBalances,
  remainingAfterDirect,
  validateDirectFundAllocations,
  type DirectFundAllocation,
} from "@/lib/direct-fund-allocation";
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
  const priorities: Array<keyof AllocationRuleFormValues> = key === "growth" ? ["life", "safety"] : ["growth", key === "life" ? "safety" : "life"];
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

function allocationId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function useNewMoney({ rule, settings, funds, assets, transactions, quotes, onSaved }: {
  rule?: AllocationRule;
  settings: AppSettings;
  funds: GoalFund[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
  onSaved: (incomeId: number) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [directFunds, setDirectFunds] = useState<DirectFundAllocation[]>([]);
  const form = useForm<NewMoneyFormValues>({ resolver: zodResolver(newMoneySchema), defaultValues: { amount: undefined, title: "پول جدید", date: new Date(), smart: true }, mode: "onBlur" });
  const allocationForm = useForm<AllocationRuleFormValues>({ resolver: zodResolver(allocationRuleSchema), defaultValues: toFormRule(fallbackRule), mode: "onChange" });
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const smart = useWatch({ control: form.control, name: "smart" }) ?? true;
  const activeRule = rule ?? fallbackRule;
  const watchedLife = useWatch({ control: allocationForm.control, name: "life" });
  const watchedSafety = useWatch({ control: allocationForm.control, name: "safety" });
  const watchedGrowth = useWatch({ control: allocationForm.control, name: "growth" });
  const allocationValues = { life: watchedLife ?? activeRule.lifePct, safety: watchedSafety ?? activeRule.safetyPct, growth: watchedGrowth ?? activeRule.growthPct };
  const amount = Number(watchedAmount) || 0;
  const directTotal = useMemo(() => directFundTotal(directFunds), [directFunds]);
  const remainingAmount = useMemo(() => remainingAfterDirect(amount, directFunds), [amount, directFunds]);
  const directError = useMemo(() => validateDirectFundAllocations(amount, directFunds, funds), [amount, directFunds, funds]);
  const fundsAfterDirect = useMemo(() => fundsWithDirectBalances(funds, directFunds), [directFunds, funds]);
  const emergency = fundsAfterDirect.find((fund) => fund.category === "emergency");

  const effectiveRule = useMemo(() => {
    if (!smart || !emergency || emergency.currentToman >= emergency.targetToman) return activeRule;
    const bonus = settings.incomeStability === "irregular" ? 15 : settings.incomeStability === "variable" ? 10 : 5;
    const actual = Math.min(bonus, activeRule.growthPct);
    return { ...activeRule, safetyPct: activeRule.safetyPct + actual, growthPct: activeRule.growthPct - actual };
  }, [activeRule, emergency, settings.incomeStability, smart]);

  const eventRule = useMemo<AllocationRule>(() => ({ ...effectiveRule, lifePct: allocationValues.life, safetyPct: allocationValues.safety, growthPct: allocationValues.growth }), [allocationValues.growth, allocationValues.life, allocationValues.safety, effectiveRule]);
  const split = useMemo(() => splitIncome(remainingAmount, eventRule), [eventRule, remainingAmount]);
  const safetyPlan = useMemo(() => buildSafetyPlan(split.safety, fundsAfterDirect), [fundsAfterDirect, split.safety]);
  const growthPlan = useMemo(() => buildGrowthPlan(split.growth, assets, transactions, quotes), [assets, quotes, split.growth, transactions]);
  const smartChanged = effectiveRule.safetyPct !== activeRule.safetyPct;
  const allocationChanged = allocationValues.life !== effectiveRule.lifePct || allocationValues.safety !== effectiveRule.safetyPct || allocationValues.growth !== effectiveRule.growthPct;

  async function next() {
    if (!await form.trigger(["amount", "title", "date"])) return;
    allocationForm.reset(toFormRule(effectiveRule));
    setStep(2);
  }

  function updateAllocation(bucket: BucketKey, value: number) {
    allocationForm.reset(rebalanceAllocation(allocationForm.getValues(), bucket, value), { keepDirty: true, keepTouched: true });
  }

  function addDirectFund() {
    setDirectFunds((current) => [...current, { id: allocationId(), amountToman: 0 }]);
  }

  function updateDirectFund(id: string, patch: Partial<Pick<DirectFundAllocation, "fundId" | "amountToman">>) {
    setDirectFunds((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function removeDirectFund(id: string) {
    setDirectFunds((current) => current.filter((row) => row.id !== id));
  }

  async function save() {
    const [moneyValid, allocationValid] = await Promise.all([form.trigger(), allocationForm.trigger()]);
    if (!moneyValid || !allocationValid || directError) return;
    const data = newMoneySchema.parse(form.getValues());
    const directRows = directFunds.filter((row) => row.amountToman > 0 && row.fundId);
    const directAmount = directFundTotal(directRows);
    const allocation = splitIncome(data.amount - directAmount, eventRule);
    const lifeAmount = Number(allocation.life ?? 0);
    const safetyAmount = Number(allocation.safety ?? 0);
    const growthAmount = Number(allocation.growth ?? 0);
    const fundPlan = buildSafetyPlan(safetyAmount, fundsWithDirectBalances(funds, directRows));
    const assetPlan = buildGrowthPlan(growthAmount, assets, transactions, quotes);
    const now = new Date().toISOString();
    let savedIncomeId: number | undefined;

    await db.transaction("rw", db.incomes, db.allocations, db.planItems, db.funds, async () => {
      const incomeIdKey = await db.incomes.add({ amountToman: data.amount, title: data.title.trim(), happenedAt: dateToISO(data.date), createdAt: now });
      if (typeof incomeIdKey !== "number") throw new Error("ثبت پول ورودی انجام نشد. دوباره تلاش کنید.");
      const incomeId = incomeIdKey;
      savedIncomeId = incomeId;
      await db.allocations.bulkAdd([
        { incomeId, bucket: "life", amountToman: lifeAmount, createdAt: now },
        { incomeId, bucket: "safety", amountToman: safetyAmount + directAmount, createdAt: now },
        { incomeId, bucket: "growth", amountToman: growthAmount, createdAt: now },
      ]);

      const plans: PlanItem[] = [];
      const directByFund = new Map<number, number>();
      for (const row of directRows) {
        const fund = funds.find((item) => item.id === row.fundId);
        if (!fund?.id) continue;
        const amountToman = Math.round(row.amountToman);
        directByFund.set(fund.id, (directByFund.get(fund.id) ?? 0) + amountToman);
        plans.push({ incomeId, bucket: "safety", targetType: "fund", targetId: fund.id, label: `${fund.name} · کنارگذاری مستقیم`, plannedToman: amountToman, executedToman: amountToman, createdAt: now, updatedAt: now });
      }
      for (const [fundId, amountToman] of directByFund) {
        const current = await db.funds.get(fundId);
        if (current) await db.funds.update(fundId, { currentToman: Math.max(0, current.currentToman) + amountToman, updatedAt: now });
      }
      appendPlanItems(plans, incomeId, lifeAmount, safetyAmount, growthAmount, fundPlan, assetPlan, now);
      if (plans.length) await db.planItems.bulkAdd(plans);
    });
    if (savedIncomeId !== undefined) onSaved(savedIncomeId);
  }

  return {
    form, values: { amount: watchedAmount, smart }, step, setStep, activeRule, effectiveRule, eventRule, split, safetyPlan, growthPlan,
    smartChanged, allocationValues, allocationChanged, updateAllocation, resetAllocation: () => allocationForm.reset(toFormRule(effectiveRule)), next, save,
    directFunds, directTotal, remainingAmount, directError, addDirectFund, updateDirectFund, removeDirectFund,
  };
}

function appendPlanItems(plans: PlanItem[], incomeId: number, lifeAmount: number, safetyAmount: number, growthAmount: number, fundPlan: ReturnType<typeof buildSafetyPlan>, assetPlan: ReturnType<typeof buildGrowthPlan>, now: string) {
  if (lifeAmount > 0) plans.push({ incomeId, bucket: "life", targetType: "life", label: "زندگی این دوره", plannedToman: lifeAmount, executedToman: 0, createdAt: now, updatedAt: now });
  let safetyAssigned = 0;
  for (const item of fundPlan) {
    if (item.amountToman <= 0) continue;
    safetyAssigned += item.amountToman;
    plans.push({ incomeId, bucket: "safety", targetType: item.fund.id ? "fund" : "bucket", targetId: item.fund.id, label: item.fund.name, plannedToman: item.amountToman, executedToman: 0, createdAt: now, updatedAt: now });
  }
  if (safetyAmount - safetyAssigned > 0) plans.push({ incomeId, bucket: "safety", targetType: "bucket", label: "امنیت و پس‌انداز", plannedToman: safetyAmount - safetyAssigned, executedToman: 0, createdAt: now, updatedAt: now });
  let growthAssigned = 0;
  for (const item of assetPlan) {
    if (!item.asset.id || item.amountToman <= 0) continue;
    growthAssigned += item.amountToman;
    plans.push({ incomeId, bucket: "growth", targetType: "asset", targetId: item.asset.id, label: item.asset.name, plannedToman: item.amountToman, executedToman: 0, createdAt: now, updatedAt: now });
  }
  if (growthAmount - growthAssigned > 0) plans.push({ incomeId, bucket: "growth", targetType: "bucket", label: "رشد و سرمایه‌گذاری", plannedToman: growthAmount - growthAssigned, executedToman: 0, createdAt: now, updatedAt: now });
}
