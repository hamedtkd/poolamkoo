"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import type { AppSettings, GoalFund } from "@/lib/types";
import { fundMovementSchema, type FundMovementFormValues } from "@/lib/validation";

export function FundMovement({ fund, onClose, settings }: { fund: GoalFund | null; onClose: () => void; settings: AppSettings }) {
  const form = useForm<FundMovementFormValues>({ resolver: zodResolver(fundMovementSchema), defaultValues: { type: "deposit", amount: undefined }, mode: "onBlur" });
  useEffect(() => { if (fund) form.reset({ type: "deposit", amount: undefined }); }, [form, fund]);
  const type = form.watch("type");

  const save = form.handleSubmit(async (values) => {
    if (!fund?.id) return;
    if (values.type === "withdraw" && values.amount > fund.currentToman) {
      form.setError("amount", { message: "برداشت نمی‌تواند بیشتر از موجودی صندوق باشد." });
      return;
    }
    const next = values.type === "deposit" ? fund.currentToman + values.amount : fund.currentToman - values.amount;
    await db.funds.update(fund.id, { currentToman: next, updatedAt: new Date().toISOString() });
    onClose();
  });

  return <Dialog open={!!fund} onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{fund?.name}</DialogTitle><DialogDescription>موجودی فعلی: {formatMoney(fund?.currentToman || 0, settings.displayUnit)}</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-4"><Controller name="type" control={form.control} render={({ field }) => <Field label="نوع"><Select value={field.value} onValueChange={field.onChange} options={[{ value: "deposit", label: "واریز به صندوق" }, { value: "withdraw", label: "برداشت از صندوق" }]} /></Field>} /><Controller name="amount" control={form.control} render={({ field, fieldState }) => <Field label="مبلغ" error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} /></Field>} /><Button type="submit" className="w-full">ثبت {type === "deposit" ? "واریز" : "برداشت"}</Button></form></DialogContent></Dialog>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-2"><label className="text-sm font-bold">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>; }
