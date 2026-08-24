"use client";

import { RiAddLine, RiDeleteBin6Line, RiSafe2Line } from "react-icons/ri";
import type { DirectFundAllocation } from "@/lib/direct-fund-allocation";
import { formatMoney } from "@/lib/format";
import type { AppSettings, GoalFund } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { RelatedEntitySelect } from "@/components/ui/related-entity-select";

export function NewMoneyDirectFunds({
  rows,
  funds,
  amount,
  directTotal,
  remainingAmount,
  error,
  settings,
  onAdd,
  onChange,
  onRemove,
  onCreateFund,
}: {
  rows: DirectFundAllocation[];
  funds: GoalFund[];
  amount: number;
  directTotal: number;
  remainingAmount: number;
  error: string;
  settings: AppSettings;
  onAdd: () => void;
  onChange: (id: string, patch: Partial<Pick<DirectFundAllocation, "fundId" | "amountToman">>) => void;
  onRemove: (id: string) => void;
  onCreateFund: (rowId?: string) => void;
}) {
  const fundOptions = funds.filter((fund) => fund.id).map((fund) => ({ value: String(fund.id), label: fund.name }));

  return (
    <section className="mt-5 rounded-2xl border bg-card/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 type-strong"><RiSafe2Line className="text-primary" /> اول مقصدهای قطعی را کنار بگذار</div>
          <p className="mt-1 max-w-xl type-caption leading-6 text-muted-foreground">اگر بخشی از این پول از قبل برای دندان‌پزشکی، سفر یا صندوق دیگری است، مستقیم واریزش کن. فقط باقی‌مانده وارد قانون درصدی می‌شود.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}><RiAddLine /> افزودن صندوق</Button>
      </div>

      {rows.length ? <div className="mt-4 space-y-3">{rows.map((row) => (
        <div key={row.id} className="grid gap-2 rounded-xl bg-muted/35 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,0.6fr)_auto] sm:items-end">
          <div className="space-y-2">
            <label className="type-caption type-body-strong">صندوق مقصد</label>
            <RelatedEntitySelect
              value={row.fundId ? String(row.fundId) : undefined}
              onValueChange={(value) => onChange(row.id, { fundId: Number(value) })}
              options={fundOptions}
              placeholder="صندوق را انتخاب کن"
              createLabel="صندوق جدید"
              onCreate={() => onCreateFund(row.id)}
            />
          </div>
          <div className="space-y-2">
            <label className="type-caption type-body-strong">مبلغ مستقیم</label>
            <MoneyInput value={row.amountToman || null} onValueChange={(value) => onChange(row.id, { amountToman: value ?? 0 })} unit={settings.displayUnit} />
          </div>
          <Button type="button" variant="ghost" size="icon" className="text-destructive" aria-label="حذف کنارگذاری مستقیم" onClick={() => onRemove(row.id)}><RiDeleteBin6Line /></Button>
        </div>
      ))}</div> : <button type="button" onClick={onAdd} className="mt-4 w-full rounded-xl border border-dashed p-4 text-center type-caption text-muted-foreground transition hover:border-primary/35 hover:text-foreground">مقصد قطعی نداری؟ این بخش را دست‌نخورده بگذار. برای کنارگذاری مستقیم کلیک کن.</button>}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric label="کل پول" value={formatMoney(amount, settings.displayUnit, true)} />
        <Metric label="مستقیم کنار گذاشته شد" value={formatMoney(directTotal, settings.displayUnit, true)} accent={directTotal > 0} />
        <Metric label="برای برنامه‌ریزی می‌ماند" value={formatMoney(remainingAmount, settings.displayUnit, true)} accent />
      </div>
      {error && <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 type-caption type-body-strong text-destructive">{error}</p>}
    </section>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-xl bg-muted/45 p-3"><div className="type-caption text-muted-foreground">{label}</div><div className={accent ? "mt-1 type-data type-body-strong text-primary" : "mt-1 type-data type-body-strong"}>{value}</div></div>;
}
