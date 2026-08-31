"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RiAlertLine, RiCheckboxCircleLine, RiFundsLine, RiFileList3Line, RiLineChartLine, RiMoneyDollarCircleLine } from "react-icons/ri";
import { DataTable, type DataTableFeatures } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { formatMoney, formatPercent, formatSignedMoney, toPersianDate } from "@/lib/format";
import type { IncomeReconciliationRow, ReportReconciliationSnapshot, ReconciliationStatus } from "@/lib/report-reconciliation";
import type { MoneyUnit } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReconciliationCard({ snapshot, unit }: { snapshot: ReportReconciliationSnapshot; unit: MoneyUnit }) {
  const columns: ColumnDef<DataTableFeatures, IncomeReconciliationRow, unknown>[] = [
    { accessorKey: "title", header: "پول ورودی", cell: ({ row }) => <div><strong>{row.original.title}</strong><div className="mt-1 text-[10px] text-muted-foreground">{toPersianDate(row.original.happenedAt)}</div></div> },
    { accessorKey: "incomeToman", header: "ورودی", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.incomeToman, unit)}</SensitiveValue> },
    { accessorKey: "allocatedToman", header: "تخصیص", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.allocatedToman, unit)}</SensitiveValue> },
    { accessorKey: "plannedToman", header: "برنامه", cell: ({ row }) => <SensitiveValue>{formatMoney(row.original.plannedToman, unit)}</SensitiveValue> },
    { accessorKey: "executedToman", header: "اجرا", cell: ({ row }) => <div><SensitiveValue>{formatMoney(row.original.executedToman, unit)}</SensitiveValue><div className="mt-1 text-[10px] text-muted-foreground">{formatPercent(row.original.executionPct, 0)}</div></div> },
    { accessorKey: "status", header: "وضعیت", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return <Card>
    <CardHeader>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>تطبیق جریان مالی این بازه</CardTitle><p className="mt-1 type-caption leading-6 text-muted-foreground">ورودی، تخصیص و برنامه برای پول‌های ورودی انتخاب‌شده تطبیق داده می‌شوند؛ گردش صندوق و سرمایه‌گذاری فقط رویدادهای واقعی داخل همین بازه‌اند.</p></div>{snapshot.attentionCount > 0 ? <Badge className="border-destructive/25 bg-destructive/10 text-destructive"><RiAlertLine /> {new Intl.NumberFormat("fa-IR").format(snapshot.attentionCount)} مورد نیاز به بررسی</Badge> : <Badge className="border-primary/25 bg-primary/10 text-primary"><RiCheckboxCircleLine /> بدون ناسازگاری ساختاری</Badge>}</div>
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FlowMetric icon={<RiMoneyDollarCircleLine />} label="پوشش تخصیص" value={formatPercent(snapshot.allocationCoveragePct, 0)} detail={gapDetail(snapshot.unallocatedToman, snapshot.overallocatedToman, "تخصیص", unit)} tone={snapshot.unallocatedToman > 1 || snapshot.overallocatedToman > 1 ? "danger" : "primary"} />
        <FlowMetric icon={<RiFileList3Line />} label="پوشش برنامه" value={formatPercent(snapshot.planningCoveragePct, 0)} detail={gapDetail(snapshot.unplannedToman, snapshot.overplannedToman, "برنامه", unit)} tone={snapshot.unplannedToman > 1 || snapshot.overplannedToman > 1 ? "danger" : "primary"} />
        <FlowMetric icon={<RiFundsLine />} label="گردش صندوق" value={formatSignedMoney(snapshot.funds.netMovement, unit, true)} detail={`واریز ${formatMoney(snapshot.funds.deposits, unit, true)} · برداشت ${formatMoney(snapshot.funds.withdrawals, unit, true)}`} />
        <FlowMetric icon={<RiLineChartLine />} label="گردش سرمایه‌گذاری" value={formatSignedMoney(snapshot.investments.netBuyFlow, unit, true)} detail={`خرید ${formatMoney(snapshot.investments.buys, unit, true)} · فروش ${formatMoney(snapshot.investments.sells, unit, true)}`} />
      </div>

      {snapshot.funds.opening > 0 && <div className="rounded-xl border border-dashed px-3 py-2 type-caption text-muted-foreground"><SensitiveValue>{formatMoney(snapshot.funds.opening, unit, true)}</SensitiveValue> موجودی آغازین صندوق در بازه دیده می‌شود؛ این عدد در «خالص گردش صندوق» حساب نشده تا پول تازه تلقی نشود.</div>}

      <div>
        <div className="mb-3"><div className="type-strong">تطبیق هر پول ورودی</div><p className="mt-1 type-caption text-muted-foreground">«در حال اجرا» ناسازگاری نیست؛ فقط یعنی بخشی از برنامه هنوز اجرای ثبت‌شده ندارد.</p></div>
        <DataTable<IncomeReconciliationRow> data={snapshot.rows} columns={columns} searchPlaceholder="جست‌وجوی پول ورودی..." emptyText="در این بازه پول ورودی ثبت نشده است." mobileCard={(row) => <MobileRow row={row} unit={unit} />} />
      </div>
    </CardContent>
  </Card>;
}

function FlowMetric({ icon, label, value, detail, tone = "neutral" }: { icon: React.ReactNode; label: string; value: string; detail: string; tone?: "primary" | "danger" | "neutral" }) {
  return <div className="rounded-2xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-2 block text-lg type-strong", tone === "danger" && "text-destructive", tone === "primary" && "text-primary")}>{value}</SensitiveValue></div><KpiIcon tone={tone}>{icon}</KpiIcon></div><SensitiveValue className="mt-2 block text-[10px] leading-5 text-muted-foreground">{detail}</SensitiveValue></div>;
}

function MobileRow({ row, unit }: { row: IncomeReconciliationRow; unit: MoneyUnit }) {
  return <div className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="type-strong">{row.title}</div><div className="mt-1 type-caption text-muted-foreground">{toPersianDate(row.happenedAt)}</div></div><StatusBadge status={row.status} /></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Small label="ورودی" value={formatMoney(row.incomeToman, unit, true)} /><Small label="تخصیص" value={formatMoney(row.allocatedToman, unit, true)} /><Small label="برنامه" value={formatMoney(row.plannedToman, unit, true)} /><Small label="اجرا" value={`${formatMoney(row.executedToman, unit, true)} · ${formatPercent(row.executionPct, 0)}`} /></div></div>;
}

function StatusBadge({ status }: { status: ReconciliationStatus }) {
  const label = status === "balanced" ? "متوازن" : status === "in_progress" ? "در حال اجرا" : "نیاز به بررسی";
  return <Badge className={cn(status === "balanced" && "border-primary/25 bg-primary/10 text-primary", status === "attention" && "border-destructive/25 bg-destructive/10 text-destructive")}>{label}</Badge>;
}
function Small({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-muted/50 p-2"><SensitiveValue className="type-strong">{value}</SensitiveValue><div className="mt-1 text-[10px] text-muted-foreground">{label}</div></div>; }
function gapDetail(missing: number, over: number, label: string, unit: MoneyUnit) { if (missing <= 1 && over <= 1) return `${label} با مبنای قبلی تطبیق دارد`; const parts: string[] = []; if (missing > 1) parts.push(`${formatMoney(missing, unit, true)} هنوز ${label} نشده`); if (over > 1) parts.push(`${formatMoney(over, unit, true)} بیشتر از مبنا ثبت شده`); return parts.join(" · "); }
