"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createBackupEnvelope, openBackupEnvelope } from "@/lib/crypto";
import { db, exportDatabaseObject, importDatabaseObject } from "@/lib/db";
import type { AllocationRule, AppSettings } from "@/lib/types";
import { allocationRuleSchema, emergencyPlanSchema, type AllocationRuleFormValues, type EmergencyPlanFormValues } from "@/lib/validation";
import { useAppTheme } from "@/hooks/use-app-theme";
import { toPersianUiError } from "@/lib/errors";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useSettingsManager(settings: AppSettings, rule?: AllocationRule) {
  const theme = useAppTheme(settings);
  const allocation = useForm<AllocationRuleFormValues>({
    resolver: zodResolver(allocationRuleSchema),
    defaultValues: { life: rule?.lifePct ?? 30, safety: rule?.safetyPct ?? 20, growth: rule?.growthPct ?? 50 },
    mode: "onChange",
  });
  const emergency = useForm<EmergencyPlanFormValues>({
    resolver: zodResolver(emergencyPlanSchema),
    defaultValues: { monthlyEssentialToman: settings.monthlyEssentialToman, emergencyMonths: settings.emergencyMonths },
    mode: "onChange",
  });
  const [backupPassword, setBackupPassword] = useState("");
  const [encryptBackup, setEncryptBackup] = useState(true);
  const [message, setMessage] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    allocation.reset({ life: rule?.lifePct ?? 30, safety: rule?.safetyPct ?? 20, growth: rule?.growthPct ?? 50 });
  }, [allocation, rule?.growthPct, rule?.id, rule?.lifePct, rule?.safetyPct]);

  useEffect(() => {
    emergency.reset({ monthlyEssentialToman: settings.monthlyEssentialToman, emergencyMonths: settings.emergencyMonths });
  }, [emergency, settings.emergencyMonths, settings.monthlyEssentialToman]);

  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault(); setInstallPrompt(event as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function updateSettings(patch: Partial<AppSettings>) {
    await db.settings.update("settings", { ...patch, updatedAt: new Date().toISOString() });
  }

  async function updateEmergencyPlan(patch: Pick<Partial<AppSettings>, "monthlyEssentialToman" | "emergencyMonths">) {
    const monthlyEssentialToman = patch.monthlyEssentialToman ?? settings.monthlyEssentialToman;
    const emergencyMonths = patch.emergencyMonths ?? settings.emergencyMonths;
    const now = new Date().toISOString();
    await db.transaction("rw", db.settings, db.funds, async () => {
      await db.settings.update("settings", { ...patch, updatedAt: now });
      const emergency = await db.funds.filter((fund) => fund.category === "emergency").first();
      const targetToman = monthlyEssentialToman * emergencyMonths;
      if (emergency?.id) await db.funds.update(emergency.id, { targetToman, updatedAt: now });
      else await db.funds.add({ name: "صندوق اضطراری", targetToman, currentToman: 0, icon: "shield", category: "emergency", createdAt: now, updatedAt: now });
    });
  }

  const saveEmergencyPlan = emergency.handleSubmit(async (values) => {
    await updateEmergencyPlan(values);
    setMessage("برنامه صندوق اضطراری ذخیره شد.");
  });

  const saveRule = allocation.handleSubmit(async (values) => {
    const now = new Date().toISOString();
    await db.allocationRules.toCollection().modify({ isActive: false });
    await db.allocationRules.add({ name: "قانون سفارشی من", preset: "custom", lifePct: values.life, safetyPct: values.safety, growthPct: values.growth, isActive: true, createdAt: now, updatedAt: now });
    setMessage("قانون پول ذخیره شد.");
  });

  async function downloadBackup() {
    try {
      if (encryptBackup && backupPassword.length < 6) { setMessage("برای بکاپ رمزنگاری‌شده رمزی با حداقل ۶ کاراکتر وارد کن."); return; }
      const payload = await exportDatabaseObject();
      const envelope = await createBackupEnvelope(JSON.stringify(payload), encryptBackup ? backupPassword : undefined);
      const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `poolyar-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
      URL.revokeObjectURL(url);
      setMessage("بکاپ ساخته شد. فایل را در جای امن نگه دار.");
    } catch (error) { setMessage(toPersianUiError(error, "ساخت بکاپ ناموفق بود. دوباره تلاش کن.")); }
  }

  async function restoreBackup(file?: File) {
    if (!file) return;
    try {
      const envelope = JSON.parse(await file.text());
      if (envelope?.format !== "poolyar-backup" || envelope?.version !== 1) throw new Error("فایل بکاپ معتبر پولم‌کو نیست.");
      const raw = await openBackupEnvelope(envelope, backupPassword || undefined);
      await importDatabaseObject(JSON.parse(raw) as Record<string, unknown>);
      setMessage("بکاپ با موفقیت بازیابی شد.");
    } catch (error) { setMessage(toPersianUiError(error, "بازیابی بکاپ ناموفق بود. فایل و رمز را بررسی کن.")); }
    finally { if (fileRef.current) fileRef.current.value = ""; }
  }

  async function installPwa() {
    if (!installPrompt) { setMessage("از منوی مرورگر «Add to Home Screen / Install app» را بزن."); return; }
    await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null);
  }

  return {
    allocation, emergency, backupPassword, setBackupPassword, encryptBackup, setEncryptBackup, message, fileRef,
    theme, updateSettings, updateEmergencyPlan, saveEmergencyPlan, saveRule, downloadBackup, restoreBackup, installPwa,
    resetOnboarding: () => updateSettings({ onboardingComplete: false }),
  };
}
