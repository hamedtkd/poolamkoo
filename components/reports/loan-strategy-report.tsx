"use client";

import Link from "next/link";
import { RiBankCardLine, RiCalendarCheckLine, RiShieldCheckLine } from "react-icons/ri";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { buildLoanViews } from "@/lib/loans/analytics";
import { formatMoney, formatSignedMoney } from "@/lib/format";
import type { AppSettings, Asset, FundMovement, GoalFund, InvestmentTransaction, Loan, LoanPayment, MarketQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LoanStrategyReport({ settings, loans, payments, periodPayments, funds, fundMovements, assets, transactions, quotes }: {
  settings: AppSettings;
  loans: Loan[];
  payments: LoanPayment[];
  periodPayments: LoanPayment[];
  funds: GoalFund[];
  fundMovements: FundMovement[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
}) {
  const views = buildLoanViews({ loans, payments, funds, fundMovements, assets, transactions, quotes });
  if (!views.length) return null;
  const active = views.filter((row) => row.loan.status === "active");
  const outstanding = active.reduce((sum, row) => sum + row.outstandingPrincipalToman, 0);
  const reserve = active.reduce((sum, row) => sum + row.reserveBalanceToman, 0);
  const net = views.reduce((sum, row) => sum + row.netStrategyEffectToman, 0);
  const paidInRange = periodPayments.reduce((sum, row) => sum + row.amountToman, 0);
  const attention = active.filter((row) => row.needsAttention).length;

  return <Card className={cn(attention > 0 && "border-destructive/20")}><CardHeader className="flex flex-row items-start justify-between gap-3"><div><CardTitle>وام و سرمایه قرضی</CardTitle><p className="mt-1 type-caption leading-6 text-muted-foreground">مانده بدهی و عملکرد سرمایه متصل به وام از درآمد عادی جدا نگه داشته می‌شود.</p></div><Link href="/loans" className={buttonStyles({ variant: "outline", size: "sm" })}>مدیریت</Link></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <Metric icon={<RiBankCardLine />} label="مانده اصل فعال" value={formatMoney(outstanding, settings.displayUnit, true)} />
    <Metric icon={<RiShieldCheckLine />} label="ذخیره فعلی" value={formatMoney(reserve, settings.displayUnit, true)} />
    <Metric icon={<RiCalendarCheckLine />} label="قسط پرداختی در بازه" value={formatMoney(paidInRange, settings.displayUnit, true)} />
    <Metric icon={<RiBankCardLine />} label="اثر خالص کل" value={formatSignedMoney(net, settings.displayUnit, true)} tone={net > 0 ? "profit" : net < 0 ? "loss" : undefined} sub={attention ? `${attention.toLocaleString("fa-IR")} وام نیازمند توجه` : "پس از کسر بدهی و آورده شخصی"}/>
  </CardContent></Card>;
}

function Metric({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone?: "profit" | "loss" }) {
  return <div className="rounded-2xl border bg-muted/15 p-3"><div className="flex items-start justify-between gap-2"><div><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className={cn("mt-1 block type-strong", tone === "profit" && "text-profit", tone === "loss" && "text-loss")}>{value}</SensitiveValue></div><span className="text-muted-foreground [&_svg]:size-4">{icon}</span></div>{sub && <div className="mt-1 type-caption text-muted-foreground">{sub}</div>}</div>;
}
