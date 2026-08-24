"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, defaultSettings } from "@/lib/db";
import { assetRequiresManualPrice } from "@/lib/assets";
import { futureFocusPercent } from "@/lib/calculations";
import { dateToISO } from "@/lib/format";
import { openingHoldingTransaction } from "@/lib/opening-holdings";
import type { LifestylePreset } from "@/lib/types";
import { onboardingSchema } from "@/lib/validation";

export const ONBOARDING_STEPS = 6;

export const lifestylePresets = [
  { id: "growth" as const, title: "رشد سریع", desc: "بیشترین تمرکز روی ساخت دارایی", life: 15, safety: 20, growth: 65 },
  { id: "balanced" as const, title: "متعادل", desc: "تعادل بین امروز، امنیت و آینده", life: 30, safety: 20, growth: 50 },
  { id: "comfort" as const, title: "آسوده‌تر زندگی کن", desc: "بودجه بیشتر برای کیفیت زندگی امروز", life: 50, safety: 20, growth: 30 },
  { id: "safety" as const, title: "امنیت اول", desc: "اول حاشیه امن، بعد رشد سرمایه", life: 30, safety: 40, growth: 30 },
];

export interface OnboardingHolding {
  id: string;
  assetId: number;
  quantity: number;
  price: number;
  date: Date;
}

export function useOnboarding(onDone: () => void) {
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState<LifestylePreset>("balanced");
  const initial = lifestylePresets[1];
  const [life, setLife] = useState(initial.life);
  const [safety, setSafety] = useState(initial.safety);
  const [growth, setGrowth] = useState(initial.growth);
  const [monthly, setMonthly] = useState<number | null>(12_000_000);
  const [months, setMonths] = useState("3");
  const [stability, setStability] = useState("stable");
  const [risk, setRisk] = useState("medium");
  const [holdings, setHoldings] = useState<OnboardingHolding[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const assets = useLiveQuery(() => db.assets.filter((asset) => !asset.archived).toArray(), []) ?? [];
  const settings = useLiveQuery(() => db.settings.get("settings"), []);
  const total = life + safety + growth;
  const gauge = useMemo(() => futureFocusPercent(safety, growth), [growth, safety]);

  function choosePreset(id: LifestylePreset) {
    const next = lifestylePresets.find((item) => item.id === id);
    if (!next) return;
    setPreset(id); setLife(next.life); setSafety(next.safety); setGrowth(next.growth);
  }

  function adjust(key: "life" | "safety" | "growth", value: number) {
    if (key === "life") setLife(value);
    if (key === "safety") setSafety(value);
    if (key === "growth") setGrowth(value);
    setPreset("custom");
  }

  function addHolding(input: Omit<OnboardingHolding, "id">) {
    setHoldings((current) => [...current, { ...input, id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}` }]);
  }

  function removeHolding(id: string) {
    setHoldings((current) => current.filter((item) => item.id !== id));
  }

  async function skip() {
    setIsSaving(true);
    setError("");
    try {
      await db.settings.update("settings", { onboardingComplete: true, updatedAt: new Date().toISOString() });
      onDone();
    } catch {
      setError("رد کردن راه‌اندازی انجام نشد. دوباره تلاش کن.");
    } finally {
      setIsSaving(false);
    }
  }

  async function finish() {
    const result = onboardingSchema.safeParse({ preset, life, safety, growth, monthly, months: Number(months), stability, risk });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "اطلاعات را کامل کن."); return; }
    setIsSaving(true);
    setError("");
    const values = result.data;
    const now = new Date().toISOString();
    const presetData = lifestylePresets.find((item) => item.id === values.preset);
    try {
      await db.transaction("rw", db.allocationRules, db.settings, db.funds, db.transactions, db.assets, async () => {
        await db.allocationRules.toCollection().modify({ isActive: false });
        await db.allocationRules.add({ name: values.preset === "custom" ? "قانون من" : presetData?.title ?? "قانون من", preset: values.preset, lifePct: values.life, safetyPct: values.safety, growthPct: values.growth, isActive: true, createdAt: now, updatedAt: now });
        await db.settings.update("settings", { onboardingComplete: true, monthlyEssentialToman: values.monthly, emergencyMonths: values.months, incomeStability: values.stability, riskTolerance: values.risk, updatedAt: now });
        const emergency = await db.funds.filter((fund) => fund.category === "emergency").first();
        const targetToman = values.monthly * values.months;
        if (emergency?.id) await db.funds.update(emergency.id, { targetToman, updatedAt: now });
        else await db.funds.add({ name: "صندوق اضطراری", targetToman, currentToman: 0, icon: "shield", category: "emergency", createdAt: now, updatedAt: now });
        if (holdings.length) {
          await db.transactions.bulkAdd(holdings.map((item) => openingHoldingTransaction({ assetId: item.assetId, quantity: item.quantity, unitPriceToman: item.price, happenedAt: dateToISO(item.date) }, now)));
          for (const item of holdings) {
            const asset = assets.find((candidate) => candidate.id === item.assetId);
            if (asset && assetRequiresManualPrice(asset.kind, asset.marketId) && asset.id) await db.assets.update(asset.id, { manualPriceToman: item.price, updatedAt: now });
          }
        }
      });
      onDone();
    } catch {
      setError("ذخیره راه‌اندازی کامل نشد. دوباره تلاش کن.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    step, setStep, preset, life, safety, growth, monthly, setMonthly, months, setMonths, stability, setStability,
    risk, setRisk, total, gauge, error, isSaving, assets, holdings, settings: settings ?? defaultSettings, displayUnit: settings?.displayUnit ?? "toman", choosePreset, adjust, addHolding, removeHolding, finish, skip,
  };
}
