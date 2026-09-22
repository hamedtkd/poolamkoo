"use client";

import { RiAlertLine, RiBankCardLine, RiCalendarCheckLine, RiShieldCheckLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KpiIcon } from "@/components/ui/kpi-icon";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { buildLoanViews } from "@/lib/loans/analytics";
import { formatMoney, toPersianDate } from "@/lib/format";
import type { LoanRiskControls } from "@/hooks/use-loan-risk";
import type { AppSettings, Asset, FundMovement, GoalFund, InvestmentTransaction, Loan, LoanPayment, MarketQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardLoanCard({ settings, loans, payments, funds, assets, transactions, fundMovements, quotes, loanRisk, onOpenLoans }: {
  settings: AppSettings;
  loans: Loan[];
  payments: LoanPayment[];
  funds: GoalFund[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  fundMovements: FundMovement[];
  quotes: MarketQuote[];
  loanRisk: LoanRiskControls;
  onOpenLoans: () => void;
}) {
  const active = buildLoanViews({ loans, payments, funds, assets, transactions, fundMovements, quotes })
    .filter((row) => row.loan.status === "active");
  if (!active.length) return null;
  const next = [...active].filter((row) => row.nextInstallment).sort((a, b) => (a.nextInstallment?.dueAt ?? "").localeCompare(b.nextInstallment?.dueAt ?? ""))[0];
  const minRunway = Math.min(...active.map((row) => row.reserveRunwayMonths));
  const critical = active.filter((row) => loanRisk.forLoan(row.loan.id)?.level === "critical").length;
  const watch = active.filter((row) => loanRisk.forLoan(row.loan.id)?.level === "watch").length;
  const outstanding = active.reduce((sum, row) => sum + row.outstandingPrincipalToman, 0);
  const urgent = critical > 0;

  return <Card className={cn("overflow-hidden", urgent && "border-destructive/25")}><CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))_auto] lg:items-center">
    <div className="flex items-start gap-3"><KpiIcon tone={urgent ? "danger" : "primary"}>{urgent ? <RiAlertLine /> : <RiBankCardLine />}</KpiIcon><div><div className="type-label">وام و بازپرداخت</div><p className="mt-1 type-caption leading-6 text-muted-foreground">{critical ? `${critical.toLocaleString("fa-IR")} وام از مرز ریسک عبور کرده است.` : watch ? `${watch.toLocaleString("fa-IR")} وام به مرز احتیاط نزدیک شده است.` : `${active.length.toLocaleString("fa-IR")} وام فعال در محدوده برنامه است.`}</p></div></div>
    <Metric icon={<RiCalendarCheckLine />} label="قسط نزدیک" value={next?.nextInstallment ? formatMoney(next.nextInstallment.amountToman, settings.displayUnit, true) : "ندارد"} sub={next?.nextInstallment ? toPersianDate(next.nextInstallment.dueAt) : undefined}/>
    <Metric icon={<RiShieldCheckLine />} label="کمترین ذخیره" value={`${minRunway.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} قسط`} sub="بین وام‌های فعال" danger={minRunway < 3}/>
    <Metric icon={<RiBankCardLine />} label="مانده اصل" value={formatMoney(outstanding, settings.displayUnit, true)} sub="جمع وام‌های فعال"/>
    <Button variant={urgent ? "default" : "outline"} onClick={onOpenLoans} className="w-full lg:w-auto">مدیریت وام‌ها</Button>
  </CardContent></Card>;
}

function Metric({ icon, label, value, sub, danger = false }: { icon: React.ReactNode; label: string; value: string; sub?: string; danger?: boolean }) {
  return <div className="flex items-center gap-2 lg:block"><span className="text-muted-foreground lg:hidden [&_svg]:size-4">{icon}</span><div><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-0.5 block type-strong", danger && "text-destructive")}>{value}</SensitiveValue>{sub && <div className="mt-0.5 type-caption text-muted-foreground">{sub}</div>}</div></div>;
}
