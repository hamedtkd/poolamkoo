"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { executeNonInvestmentPlan, planRemaining } from "@/lib/plan-execution";
import type { AppSettings, PlanItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";

const T = {
  title: "\u062b\u0628\u062a \u0627\u062c\u0631\u0627\u06cc \u0628\u0631\u0646\u0627\u0645\u0647",
  desc: "\u0645\u0628\u0644\u063a\u06cc \u06a9\u0647 \u0648\u0627\u0642\u0639\u0627\u064b \u06a9\u0646\u0627\u0631 \u06af\u0630\u0627\u0634\u062a\u06cc \u06cc\u0627 \u0628\u0647 \u0627\u06cc\u0646 \u0628\u062e\u0634 \u0627\u062e\u062a\u0635\u0627\u0635 \u062f\u0627\u062f\u06cc \u0631\u0627 \u062b\u0628\u062a \u06a9\u0646.",
  amount: "\u0645\u0628\u0644\u063a \u0627\u062c\u0631\u0627\u0634\u062f\u0647",
  submit: "\u062b\u0628\u062a \u0627\u062c\u0631\u0627",
  required: "\u0645\u0628\u0644\u063a \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646.",
  positive: "\u0645\u0628\u0644\u063a \u0628\u0627\u06cc\u062f \u0628\u06cc\u0634\u062a\u0631 \u0627\u0632 \u0635\u0641\u0631 \u0628\u0627\u0634\u062f.",
  max: "\u0645\u0628\u0644\u063a \u0627\u062c\u0631\u0627 \u0646\u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u062f \u0627\u0632 \u0628\u0627\u0642\u06cc\u200c\u0645\u0627\u0646\u062f\u0647 \u0628\u0631\u0646\u0627\u0645\u0647 \u0628\u06cc\u0634\u062a\u0631 \u0628\u0627\u0634\u062f.",
};

export function PlanExecutionDialog({ item, settings, onClose }: { item: PlanItem | null; settings: AppSettings; onClose: () => void }) {
  const remaining = item ? planRemaining(item) : 0;
  const schema = useMemo(() => z.object({ amount: z.number({ error: T.required }).positive(T.positive).max(Math.max(remaining, 1), T.max) }), [remaining]);
  const form = useForm<{ amount: number }>({ resolver: zodResolver(schema), defaultValues: { amount: remaining || undefined }, mode: "onBlur" });

  useEffect(() => {
    form.reset({ amount: remaining || undefined });
  }, [form, item?.id, remaining]);

  const submit = form.handleSubmit(async ({ amount }) => {
    if (!item) return;
    await executeNonInvestmentPlan(item, amount);
    onClose();
  });

  return <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader><DialogTitle>{T.title}</DialogTitle><DialogDescription>{item?.label} - {T.desc}</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <Controller name="amount" control={form.control} render={({ field, fieldState }) => <div className="space-y-2"><label className="text-sm type-strong">{T.amount}</label><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} invalid={Boolean(fieldState.error)} />{fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}</div>} />
        <Button type="submit" className="w-full">{T.submit}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}
