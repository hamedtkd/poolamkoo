"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { RiWallet3Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { db } from "@/lib/db";
import { formatPercent } from "@/lib/format";
import type { AllocationRule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { allocationRuleSchema, type AllocationRuleFormValues } from "@/lib/validation";

export function AllocationRuleCard({ rule }: { rule?: AllocationRule }) {
  const [message, setMessage] = useState("");
  const form = useForm<AllocationRuleFormValues>({
    resolver: zodResolver(allocationRuleSchema),
    defaultValues: toFormValues(rule),
    mode: "onChange",
  });
  const life = useWatch({ control: form.control, name: "life" });
  const safety = useWatch({ control: form.control, name: "safety" });
  const growth = useWatch({ control: form.control, name: "growth" });
  const total = (life ?? 0) + (safety ?? 0) + (growth ?? 0);

  useEffect(() => {
    form.reset(toFormValues(rule));
  }, [form, rule]);

  const save = form.handleSubmit(async (values) => {
    const now = new Date().toISOString();
    await db.allocationRules.toCollection().modify({ isActive: false });
    await db.allocationRules.add({ name: "قانون سفارشی من", preset: "custom", lifePct: values.life, safetyPct: values.safety, growthPct: values.growth, isActive: true, createdAt: now, updatedAt: now });
    setMessage("قانون پول ذخیره شد.");
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><RiWallet3Line className="text-primary" /> قانون پول من</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-5">
          <Controller name="life" control={form.control} render={({ field }) => <AllocationSlider label="زندگی" value={field.value} onChange={field.onChange} />} />
          <Controller name="safety" control={form.control} render={({ field }) => <AllocationSlider label="امنیت" value={field.value} onChange={field.onChange} />} />
          <Controller name="growth" control={form.control} render={({ field, fieldState }) => <AllocationSlider label="رشد" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
          <div className={cn("flex items-center justify-between rounded-xl px-3 py-2 text-sm type-strong", Math.round(total) === 100 ? "bg-primary/8 text-primary" : "bg-destructive/10 text-destructive")}><span>مجموع</span><span>{formatPercent(total, 0)}</span></div>
          {message && <p className="text-xs type-strong text-primary">{message}</p>}
          <Button type="submit" className="w-full">ذخیره قانون تخصیص</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function toFormValues(rule?: AllocationRule): AllocationRuleFormValues {
  return { life: rule?.lifePct ?? 30, safety: rule?.safetyPct ?? 20, growth: rule?.growthPct ?? 50 };
}

function AllocationSlider({ label, value, onChange, error }: { label: string; value: number; onChange: (value: number) => void; error?: string }) {
  return <div className="space-y-2"><div className="flex items-center justify-between"><Label>{label}</Label><span className="text-sm type-strong text-primary">{formatPercent(value, 0)}</span></div><Slider min={0} max={100} step={5} value={[value]} onValueChange={([next]) => onChange(next)} />{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
