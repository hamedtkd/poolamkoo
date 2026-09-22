import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensitiveValue } from "@/components/ui/sensitive-value";
import { buildLoanIntelligence } from "@/lib/loans/intelligence";
import { buildLoanViews } from "@/lib/loans/analytics";
import { formatMoney, formatPercent, formatSignedMoney } from "@/lib/format";
import type { AppSettings, Asset, FundMovement, GoalFund, IncomeEvent, InvestmentTransaction, Loan, LoanPayment, MarketQuote } from "@/lib/types";

export function LoanIntelligenceReport({ settings, loans, payments, funds, fundMovements, assets, transactions, quotes, incomes }: {
  settings: AppSettings;
  loans: Loan[];
  payments: LoanPayment[];
  funds: GoalFund[];
  fundMovements: FundMovement[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  quotes: MarketQuote[];
  incomes: IncomeEvent[];
}) {
  const views = buildLoanViews({ loans, payments, funds, fundMovements, assets, transactions, quotes });
  if (!views.length) return null;
  return <Card><CardHeader><CardTitle>گزارش هوش وام</CardTitle><p className="mt-1 type-caption text-muted-foreground">خلاصه تصمیم، عملکرد دارایی، ریسک و سناریوهای وام‌های ثبت‌شده.</p></CardHeader><CardContent className="space-y-3">{views.map((view) => {
    const insight = buildLoanIntelligence({ view, settings, incomes, transactions });
    return <div key={view.loan.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{view.loan.name}</strong><span className="type-caption text-muted-foreground">امتیاز {insight.healthScore}/۱۰۰</span></div><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><ReportMetric label="هزینه تأمین مالی" value={formatMoney(insight.financingCostToman, settings.displayUnit, true)} /><ReportMetric label="ارزش دارایی" value={formatMoney(insight.assetValueToman, settings.displayUnit, true)} /><ReportMetric label="سود/زیان" value={formatSignedMoney(insight.assetPnlToman, settings.displayUnit, true)} /><ReportMetric label="بازده" value={insight.assetReturnPct === null ? "نامشخص" : formatPercent(insight.assetReturnPct, 1)} /><ReportMetric label="شوک ترکیبی" value={formatSignedMoney(insight.combinedShockToman, settings.displayUnit, true)} /></div><div className="mt-3 type-caption text-muted-foreground">{insight.healthMessage}</div><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 type-caption text-muted-foreground">{insight.timeline.map((event) => <span key={event.key}>{event.label}: {event.date.slice(0, 10)}</span>)}</div></div>;
  })}</CardContent></Card>;
}

function ReportMetric({ label, value }: { label: string; value: string }) { return <div><div className="type-caption text-muted-foreground">{label}</div><SensitiveValue className="mt-1 block type-strong">{value}</SensitiveValue></div>; }
