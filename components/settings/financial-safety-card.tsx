"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { RiRefreshLine, RiShieldKeyholeLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SettingsField } from "@/components/settings/settings-field";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import type { AppSettings } from "@/lib/types";
import { emergencyPlanSchema, type EmergencyPlanFormValues } from "@/lib/validation";

export function FinancialSafetyCard({ settings }: { settings: AppSettings }) {
  const [message, setMessage] = useState("");
  const form = useForm<EmergencyPlanFormValues>({
    resolver: zodResolver(emergencyPlanSchema),
    defaultValues: { monthlyEssentialToman: settings.monthlyEssentialToman, emergencyMonths: settings.emergencyMonths },
    mode: "onChange",
  });
  const monthlyEssentialToman = useWatch({ control: form.control, name: "monthlyEssentialToman" }) ?? 0;
  const emergencyMonths = useWatch({ control: form.control, name: "emergencyMonths" }) ?? 0;

  useEffect(() => {
    form.reset({ monthlyEssentialToman: settings.monthlyEssentialToman, emergencyMonths: settings.emergencyMonths });
  }, [form, settings.emergencyMonths, settings.monthlyEssentialToman]);

  async function updateSettings(patch: Partial<AppSettings>) {
    await db.settings.update("settings", { ...patch, updatedAt: new Date().toISOString() });
  }

  const save = form.handleSubmit(async (values) => {
    const now = new Date().toISOString();
    await db.transaction("rw", db.settings, db.funds, async () => {
      await db.settings.update("settings", { monthlyEssentialToman: values.monthlyEssentialToman, emergencyMonths: values.emergencyMonths, updatedAt: now });
      const emergency = await db.funds.filter((fund) => fund.category === "emergency").first();
      const targetToman = values.monthlyEssentialToman * values.emergencyMonths;
      if (emergency?.id) await db.funds.update(emergency.id, { targetToman, updatedAt: now });
      else await db.funds.add({ name: "صندوق اضطراری", targetToman, currentToman: 0, icon: "shield", category: "emergency", createdAt: now, updatedAt: now });
    });
    setMessage("برنامه صندوق اضطراری ذخیره شد.");
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><RiShieldKeyholeLine className="text-primary" /> امنیت مالی و سبک درآمد</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <SettingsField label="ثبات درآمد"><Select value={settings.incomeStability} onValueChange={(value) => void updateSettings({ incomeStability: value as AppSettings["incomeStability"] })} options={[{ value: "stable", label: "ثابت" }, { value: "variable", label: "متغیر" }, { value: "irregular", label: "نامنظم" }]} /></SettingsField>
          <SettingsField label="تحمل نوسان"><Select value={settings.riskTolerance} onValueChange={(value) => void updateSettings({ riskTolerance: value as AppSettings["riskTolerance"] })} options={[{ value: "low", label: "کم" }, { value: "medium", label: "متوسط" }, { value: "high", label: "زیاد" }]} /></SettingsField>
        </div>
        <form onSubmit={save} className="space-y-4">
          <Controller name="monthlyEssentialToman" control={form.control} render={({ field, fieldState }) => <SettingsField label="هزینه ضروری ماهانه"><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} />{fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}</SettingsField>} />
          <Controller name="emergencyMonths" control={form.control} render={({ field, fieldState }) => <SettingsField label={`هدف ذخیره اضطراری: ${new Intl.NumberFormat("fa-IR").format(field.value)} ماه`}><Slider min={1} max={12} step={1} value={[field.value]} onValueChange={([value]) => field.onChange(value)} />{fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}</SettingsField>} />
          <div className="rounded-2xl bg-muted/60 p-3 text-sm"><div className="type-caption text-muted-foreground">هدف تقریبی صندوق اضطراری</div><div className="mt-1 type-strong">{formatMoney(monthlyEssentialToman * emergencyMonths, settings.displayUnit)}</div></div>
          {message && <p className="text-xs type-strong text-primary">{message}</p>}
          <Button type="submit" className="w-full">ذخیره برنامه امنیت مالی</Button>
        </form>
        <Button variant="outline" onClick={() => void updateSettings({ onboardingComplete: false })}><RiRefreshLine /> اجرای دوباره آنبوردینگ</Button>
      </CardContent>
    </Card>
  );
}
