"use client";

import { useMemo, useState } from "react";
import { RiCheckLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoanField } from "@/components/loans/loan-form-parts";
import { toast } from "@/components/ui/toast";
import { dateToISO, formatMoney, isoToDate, toPersianDate } from "@/lib/format";
import { loanContractInstallment } from "@/lib/loans/calculations";
import { recordLoanPaymentFromSources } from "@/lib/loans/payments";
import { loanInstallmentDueAt } from "@/lib/loans/schedule";
import { toPersianUiError } from "@/lib/errors";
import type { AppSettings, InvestmentTransaction, Loan, LoanPayment } from "@/lib/types";
import { cn } from "@/lib/utils";

const sourceOptions = [
  { value: "reserve", label: "ذخیره اقساط" },
  { value: "external", label: "پول شخصی" },
  { value: "asset_sale", label: "فروش دارایی" },
  { value: "mixed", label: "ترکیبی" },
];

type Source = "reserve" | "external" | "asset_sale" | "mixed";

export function LoanPaymentDialog({ open, onOpenChange, loan, payments, transactions, reserveBalanceToman, settings }: {
  open: boolean; onOpenChange: (open: boolean) => void; loan: Loan; payments: LoanPayment[]; transactions: InvestmentTransaction[]; reserveBalanceToman: number; settings: AppSettings;
}) {
  const paid = useMemo(() => new Set(payments.filter((row) => row.loanId === loan.id).map((row) => row.installmentNo)), [loan.id, payments]);
  const unpaid = useMemo(() => Array.from({ length: loan.termMonths }, (_, index) => index + 1).filter((n) => !paid.has(n)), [loan.termMonths, paid]);
  const usedSaleIds = useMemo(() => new Set(payments.flatMap((row) => row.saleTransactionIds ?? [])), [payments]);
  const sales = useMemo(() => transactions.filter((row) => row.type === "sell" && row.id && !usedSaleIds.has(row.id) && row.loanId === loan.id), [loan.id, transactions, usedSaleIds]);
  const defaultNo = unpaid[0] ?? loan.termMonths;
  const defaultAmount = loanContractInstallment(loan);
  const [installmentNo, setInstallmentNo] = useState(defaultNo);
  const [amount, setAmount] = useState<number | null>(defaultAmount);
  const [paidAt, setPaidAt] = useState(dateToISO(new Date()));
  const [source, setSource] = useState<Source>(loan.reserveFundId ? "reserve" : "external");
  const [reserve, setReserve] = useState(loan.reserveFundId ? defaultAmount : 0);
  const [external, setExternal] = useState(loan.reserveFundId ? 0 : defaultAmount);
  const [assetSale, setAssetSale] = useState(0);
  const [saleIds, setSaleIds] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  function changeSource(next: string) {
    const value = next as Source; const total = amount ?? 0; setSource(value); setSaleIds([]);
    if (value === "reserve") { setReserve(total); setExternal(0); setAssetSale(0); }
    if (value === "external") { setReserve(0); setExternal(total); setAssetSale(0); }
    if (value === "asset_sale") { setReserve(0); setExternal(0); setAssetSale(total); }
    if (value === "mixed") { setReserve(0); setExternal(total); setAssetSale(0); }
  }
  const parts = reserve + external + assetSale;
  const mismatch = amount !== null && Math.abs(parts - amount) > 0.5;
  const selectedProceeds = sales.filter((row) => row.id && saleIds.includes(row.id)).reduce((sum, row) => sum + Math.max(0, row.amountToman - (row.feeToman ?? 0) - (row.otherCostToman ?? 0)), 0);

  async function save() {
    if (!loan.id || !amount || mismatch) return;
    setBusy(true);
    try {
      await recordLoanPaymentFromSources({ loanId: loan.id, installmentNo, dueAt: loanInstallmentDueAt(loan.firstPaymentAt, installmentNo), amountToman: amount, paidAt, reserveToman: reserve, externalToman: external, assetSaleToman: assetSale, saleTransactionIds: assetSale > 0 ? saleIds : undefined, note: note.trim() || undefined });
      toast({ tone: "success", title: `قسط ${installmentNo.toLocaleString("fa-IR")} ثبت شد`, description: external > 0 ? "پول شخصی جدا از عملکرد استراتژی محاسبه می‌شود." : "دفتر وام و منبع پرداخت با هم به‌روز شدند." });
      onOpenChange(false);
    } catch (error) { toast({ tone: "error", title: "ثبت پرداخت انجام نشد", description: toPersianUiError(error, "منبع پرداخت و موجودی را بررسی کن.") }); }
    finally { setBusy(false); }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>ثبت پرداخت قسط</DialogTitle><DialogDescription>منبع واقعی پرداخت را ثبت کن تا سود سرمایه‌گذاری با پول شخصی مخلوط نشود.</DialogDescription></DialogHeader><div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><LoanField label="شماره قسط"><Select value={String(installmentNo)} onValueChange={(v) => setInstallmentNo(Number(v))} options={unpaid.map((n) => ({ value: String(n), label: `قسط ${n.toLocaleString("fa-IR")} · ${toPersianDate(loanInstallmentDueAt(loan.firstPaymentAt, n))}` }))}/></LoanField><LoanField label="مبلغ پرداخت"><MoneyInput value={amount} onValueChange={(value) => { setAmount(value); if (source === "reserve") setReserve(value ?? 0); if (source === "external") setExternal(value ?? 0); if (source === "asset_sale") setAssetSale(value ?? 0); }} unit={settings.displayUnit}/></LoanField><LoanField label="تاریخ پرداخت"><DatePicker value={isoToDate(paidAt)} onValueChange={(v) => v && setPaidAt(dateToISO(v))}/></LoanField><LoanField label="منبع پرداخت"><Select value={source} onValueChange={changeSource} options={sourceOptions.filter((option) => option.value !== "reserve" || loan.reserveFundId)}/></LoanField></div>
    {loan.reserveFundId && (source === "mixed" || source === "reserve") && <LoanField label="از ذخیره" hint={`موجودی: ${formatMoney(reserveBalanceToman, settings.displayUnit, true)}`}><MoneyInput value={reserve || null} onValueChange={(v) => setReserve(v ?? 0)} unit={settings.displayUnit}/></LoanField>}
    {(source === "mixed" || source === "external") && <LoanField label="از پول شخصی"><MoneyInput value={external || null} onValueChange={(v) => setExternal(v ?? 0)} unit={settings.displayUnit}/></LoanField>}
    {(source === "mixed" || source === "asset_sale") && <><LoanField label="از فروش دارایی"><MoneyInput value={assetSale || null} onValueChange={(v) => setAssetSale(v ?? 0)} unit={settings.displayUnit}/></LoanField><SalePicker sales={sales} selected={saleIds} onSelected={setSaleIds} unit={settings.displayUnit}/>{assetSale > selectedProceeds && <p className="type-caption text-destructive">وجه فروش انتخاب‌شده برای این سهم کافی نیست.</p>}</>}
    {mismatch && <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 type-caption text-destructive">جمع منابع باید دقیقاً برابر مبلغ پرداخت باشد. اختلاف: {formatMoney(Math.abs((amount ?? 0) - parts), settings.displayUnit, true)}</div>}
    <LoanField label="یادداشت" hint="اختیاری"><Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200}/></LoanField><Button className="w-full" onClick={() => void save()} disabled={busy || mismatch || (assetSale > 0 && (saleIds.length === 0 || assetSale > selectedProceeds))}>{busy ? "در حال ثبت..." : "ثبت پرداخت"}</Button></div></DialogContent></Dialog>;
}

function SalePicker({ sales, selected, onSelected, unit }: { sales: InvestmentTransaction[]; selected: number[]; onSelected: (ids: number[]) => void; unit: AppSettings["displayUnit"] }) {
  if (!sales.length) return <div className="rounded-xl border border-dashed p-4 type-caption text-muted-foreground">فروش متصل به همین وام پیدا نشد. فروش شخصی را به‌عنوان پول شخصی ثبت کن؛ فقط فروش دارایی تامین‌شده با این وام منبع «فروش دارایی» است.</div>;
  return <div className="space-y-2"><div className="type-label">فروش‌های تامین‌کننده قسط</div>{sales.map((sale) => { const id = sale.id!; const active = selected.includes(id); const proceeds = Math.max(0, sale.amountToman - (sale.feeToman ?? 0) - (sale.otherCostToman ?? 0)); return <button type="button" key={id} onClick={() => onSelected(active ? selected.filter((x) => x !== id) : [...selected, id])} className={cn("flex min-h-12 w-full items-center justify-between rounded-xl border px-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active && "border-primary bg-primary/7")}><span><span className="block type-label">فروش {toPersianDate(sale.happenedAt)}</span><span className="type-caption text-muted-foreground">{formatMoney(proceeds, unit, true)}</span></span>{active && <RiCheckLine className="size-5 text-primary"/>}</button>; })}</div>;
}
