"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { createRecoverySnapshot } from "@/lib/recovery";
import { db } from "@/lib/db";
import { recordFundMovement, updateManualFundMovement } from "@/lib/fund-ledger-store";
import { dateToISO, formatMoney, isoToDate } from "@/lib/format";
import { toPersianUiError } from "@/lib/errors";
import type { AppSettings, FundMovement, GoalFund } from "@/lib/types";
import { fundMovementSchema, type FundMovementFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export function FundMovementDialog({ fund, movement, onClose, settings }: {
  fund: GoalFund | null;
  movement?: FundMovement | null;
  onClose: () => void;
  settings: AppSettings;
}) {
  const form = useForm<FundMovementFormValues>({
    resolver: zodResolver(fundMovementSchema),
    defaultValues: {
      type: movement?.type === "withdraw" ? "withdraw" : "deposit",
      amount: movement?.amountToman,
      date: isoToDate(movement?.happenedAt) ?? new Date(),
      note: movement?.note ?? "",
    },
    mode: "onBlur",
  });
  const open = Boolean(fund);
  const loanRows = useLiveQuery(() => open ? db.loans.where("status").equals("active").toArray() : [], [open]);
  const loans = loanRows ?? [];
  const reserveLoan = loans.find((loan) => loan.reserveFundId === fund?.id);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null | undefined>(movement?.loanId);
  const loanId = selectedLoanId === undefined ? movement?.loanId ?? reserveLoan?.id ?? null : selectedLoanId;
  const type = useWatch({ control: form.control, name: "type" }) ?? "deposit";

  const save = form.handleSubmit(async (values) => {
    if (!fund?.id) return;
    try {
      if (movement) {
        await createRecoverySnapshot("قبل از اصلاح گردش صندوق");
        await updateManualFundMovement(movement, {
          type: values.type,
          amountToman: values.amount,
          happenedAt: dateToISO(values.date),
          note: values.note,
        });
      } else {
        await recordFundMovement({
          fundId: fund.id,
          type: values.type,
          source: "manual",
          amountToman: values.amount,
          happenedAt: dateToISO(values.date),
          note: values.note,
          loanId: values.type === "deposit" ? loanId ?? undefined : undefined,
        });
      }
      toast({ tone: "success", title: movement ? "گردش صندوق اصلاح شد" : "گردش صندوق ثبت شد" });
      onClose();
    } catch (error) {
      form.setError("root.ledger", { message: toPersianUiError(error, "ثبت گردش صندوق انجام نشد.") });
    }
  });

  return <Dialog open={open} onOpenChange={(next) => !next && onClose()}><DialogContent>
    <DialogHeader>
      <DialogTitle>{movement ? "اصلاح گردش صندوق" : fund?.name}</DialogTitle>
      <DialogDescription>موجودی فعلی: {formatMoney(fund?.currentToman || 0, settings.displayUnit)}. تاریخچه صندوق باید در هیچ روزی منفی نشود.</DialogDescription>
    </DialogHeader>
    <form onSubmit={save} onChange={() => form.clearErrors("root.ledger")} className="space-y-4">
      <Controller name="type" control={form.control} render={({ field }) => <Field label="نوع"><Select value={field.value} onValueChange={field.onChange} options={[{ value: "deposit", label: "واریز به صندوق" }, { value: "withdraw", label: "برداشت از صندوق" }]} /></Field>} />
      <Controller name="amount" control={form.control} render={({ field, fieldState }) => <Field label="مبلغ" error={fieldState.error?.message}><MoneyInput value={field.value ?? null} onValueChange={field.onChange} unit={settings.displayUnit} /></Field>} />
      <Controller name="date" control={form.control} render={({ field, fieldState }) => <Field label="تاریخ" error={fieldState.error?.message}><DatePicker value={field.value ?? null} onValueChange={field.onChange} /></Field>} />
      <Field label="یادداشت اختیاری" error={form.formState.errors.note?.message}><Textarea {...form.register("note")} placeholder="مثلاً بخشی از درآمد مرداد" /></Field>
      {!movement && type === "deposit" && loans.length > 0 && <Field label="ارتباط با وام" error={undefined}><Select value={loanId ? String(loanId) : "personal"} onValueChange={(value) => setSelectedLoanId(value === "personal" ? null : Number(value))} options={[{ value: "personal", label: "پول شخصی بدون ارتباط با وام" }, ...loans.filter((loan) => loan.id).map((loan) => ({ value: String(loan.id), label: reserveLoan?.id === loan.id ? `${loan.name} · ذخیره رسمی این وام` : loan.name }))]} /></Field>}
      {!movement && type === "deposit" && loanId && <p className="rounded-xl border border-primary/15 bg-primary/[.045] px-3 py-2 type-caption leading-6 text-muted-foreground">این واریز به عنوان آورده شخصی مرتبط با وام ثبت می‌شود تا سود و زیان استراتژی با پول خودت اشتباه نشود.</p>}
      {form.formState.errors.root?.ledger?.message && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.ledger.message}</p>}
      <Button type="submit" className="w-full">{movement ? "ذخیره اصلاح" : `ثبت ${type === "deposit" ? "واریز" : "برداشت"}`}</Button>
    </form>
  </DialogContent></Dialog>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-sm type-strong">{label}</label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
