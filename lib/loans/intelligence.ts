import type { AppSettings, IncomeEvent, InvestmentTransaction } from "../types.ts";
import { loanAmortizationSchedule, loanContractInstallment, loanTotalRepayment } from "./calculations.ts";
import type { LoanView } from "./analytics.ts";

export type LoanAllocationTemplate = {
  id: "conservative" | "balanced" | "growth";
  title: string;
  description: string;
  disclaimer: string;
  rows: Array<{ kind: "fund" | "gold" | "stock" | "cash"; label: string; percent: number }>;
};

export type LoanShock = {
  label: string;
  assetKind: string;
  percent: number;
  impactToman: number;
};

export type LoanTimelineEvent = {
  key: string;
  label: string;
  date: string;
  detail: string;
  status: "complete" | "current" | "upcoming";
};

export type LoanIntelligence = {
  financingCostToman: number;
  totalRepaymentToman: number;
  assetReturnPct: number | null;
  assetValueToman: number;
  assetPnlToman: number;
  healthScore: number;
  healthLevel: "healthy" | "watch" | "critical";
  healthMessage: string;
  installmentToIncomePct: number | null;
  reserveInstallments: number;
  debtCoveragePct: number;
  cashScenarioValueToman: number;
  investmentScenarioValueToman: number;
  investmentScenarioPnlToman: number;
  earlyRepaymentInterestSavingToman: number;
  templates: LoanAllocationTemplate[];
  shocks: LoanShock[];
  combinedShockToman: number;
  combinedShockNetToman: number;
  timeline: LoanTimelineEvent[];
  monthlyIncomeToman: number | null;
};

const TEMPLATE_DISCLAIMER = "این یک قالب تحلیلی است، نه توصیه قطعی مالی.";

export function buildLoanIntelligence(input: {
  view: LoanView;
  settings?: Pick<AppSettings, "riskTolerance">;
  monthlyIncomeToman?: number;
  incomes?: readonly IncomeEvent[];
  transactions?: readonly InvestmentTransaction[];
}): LoanIntelligence {
  const { view } = input;
  const monthlyIncomeToman = input.monthlyIncomeToman ?? estimateMonthlyIncome(input.incomes ?? []);
  const totalRepaymentToman = loanTotalRepayment(view.loan);
  const financingCostToman = Math.max(0, totalRepaymentToman - view.loan.principalToman);
  const assetReturnPct = view.linkedAssetCostToman > 0 ? view.linkedAssetPnlToman / view.linkedAssetCostToman * 100 : null;
  const installmentToIncomePct = monthlyIncomeToman && monthlyIncomeToman > 0
    ? view.installmentToman / monthlyIncomeToman * 100
    : null;
  const debtCoveragePct = view.outstandingPrincipalToman > 0
    ? view.linkedAssetValueToman / view.outstandingPrincipalToman * 100
    : 100;
  const healthScore = calculateLoanHealthScore({
    installmentToIncomePct,
    reserveInstallments: view.reserveRunwayMonths,
    reserveTargetMonths: view.loan.reserveTargetMonths,
    assetCoveragePct: debtCoveragePct,
    overdue: view.overdue,
  });
  const investmentScenarioValueToman = view.linkedAssetValueToman + view.loanCashToman;
  const cashScenarioValueToman = Math.max(0, view.loan.principalToman - view.externalContributionsToman);
  const remainingInterest = loanAmortizationSchedule(view.loan)
    .slice(view.paidInstallments)
    .reduce((sum, row) => sum + row.interestToman, 0);
  const shocks = buildLoanShocks(view);
  const combinedShockToman = shocks.reduce((sum, shock) => sum + shock.impactToman, 0);

  return {
    financingCostToman,
    totalRepaymentToman,
    assetReturnPct,
    assetValueToman: view.linkedAssetValueToman,
    assetPnlToman: view.linkedAssetPnlToman,
    healthScore,
    healthLevel: healthScore >= 70 ? "healthy" : healthScore >= 45 ? "watch" : "critical",
    healthMessage: healthMessage(healthScore, view.reserveRunwayMonths, installmentToIncomePct),
    installmentToIncomePct,
    reserveInstallments: view.reserveRunwayMonths,
    debtCoveragePct,
    cashScenarioValueToman,
    investmentScenarioValueToman,
    investmentScenarioPnlToman: investmentScenarioValueToman - cashScenarioValueToman,
    earlyRepaymentInterestSavingToman: Math.max(0, remainingInterest),
    templates: buildAllocationTemplates(input.settings?.riskTolerance ?? "medium"),
    shocks,
    combinedShockToman,
    combinedShockNetToman: view.grossLoanEquityToman + combinedShockToman,
    timeline: buildLoanTimeline(view, input.transactions ?? []),
    monthlyIncomeToman: monthlyIncomeToman && monthlyIncomeToman > 0 ? monthlyIncomeToman : null,
  };
}

export function calculateLoanHealthScore(input: {
  installmentToIncomePct: number | null;
  reserveInstallments: number;
  reserveTargetMonths: number;
  assetCoveragePct: number;
  overdue: boolean;
}) {
  let score = 100;
  if (input.installmentToIncomePct === null) score -= 8;
  else if (input.installmentToIncomePct > 50) score -= 35;
  else if (input.installmentToIncomePct > 35) score -= 22;
  else if (input.installmentToIncomePct > 25) score -= 10;
  if (input.reserveInstallments < 1) score -= 25;
  else if (input.reserveInstallments < Math.max(2, input.reserveTargetMonths * 0.5)) score -= 15;
  else if (input.reserveInstallments < input.reserveTargetMonths) score -= 7;
  if (input.assetCoveragePct < 50) score -= 20;
  else if (input.assetCoveragePct < 100) score -= 10;
  if (input.overdue) score -= 35;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildAllocationTemplates(riskTolerance: "low" | "medium" | "high" | string): LoanAllocationTemplate[] {
  const templates: LoanAllocationTemplate[] = [
    { id: "conservative", title: "محافظه‌کار", description: "تمرکز بیشتر بر نقدشوندگی و نوسان کمتر.", disclaimer: TEMPLATE_DISCLAIMER, rows: [{ kind: "fund", label: "صندوق", percent: 60 }, { kind: "gold", label: "طلا", percent: 20 }, { kind: "cash", label: "نقد", percent: 20 }] },
    { id: "balanced", title: "متعادل", description: "ترکیب متوازن برای مقایسه سناریوها.", disclaimer: TEMPLATE_DISCLAIMER, rows: [{ kind: "fund", label: "صندوق", percent: 40 }, { kind: "gold", label: "طلا", percent: 40 }, { kind: "stock", label: "سهام", percent: 20 }] },
    { id: "growth", title: "رشد", description: "سهم بیشتر دارایی‌های نوسانی برای سناریوی رشد.", disclaimer: TEMPLATE_DISCLAIMER, rows: [{ kind: "fund", label: "صندوق", percent: 20 }, { kind: "gold", label: "طلا", percent: 50 }, { kind: "stock", label: "سهام", percent: 30 }] },
  ];
  const preferred = riskTolerance === "low" ? "conservative" : riskTolerance === "high" ? "growth" : "balanced";
  return templates.map((template) => ({
    ...template,
    title: template.id === preferred ? `${template.title} · نزدیک به تحمل ریسک شما` : template.title,
    disclaimer: TEMPLATE_DISCLAIMER,
  }));
}

function buildLoanShocks(view: LoanView): LoanShock[] {
  const defaults: Record<string, number> = { gold: -30, stock: -30, currency: -15, crypto: -40, fund: -10, custom: -20 };
  return view.positions.map((position) => {
    const percent = defaults[position.asset.kind] ?? -20;
    return { label: position.asset.name, assetKind: position.asset.kind, percent, impactToman: position.currentValueToman * percent / 100 };
  });
}

function buildLoanTimeline(view: LoanView, transactions: readonly InvestmentTransaction[]): LoanTimelineEvent[] {
  const now = new Date().toISOString().slice(0, 10);
  const linkedTransactions = transactions.filter((transaction) => transaction.loanId === view.loan.id && transaction.type === "buy");
  const firstInvestment = linkedTransactions.sort((left, right) => left.happenedAt.localeCompare(right.happenedAt))[0]?.happenedAt;
  return [
    { key: "disbursed", label: "دریافت وام", date: view.loan.disbursedAt, detail: "قرارداد وام ثبت شد.", status: "complete" },
    { key: "first-payment", label: "اولین پرداخت", date: view.loan.firstPaymentAt, detail: `${loanContractInstallment(view.loan).toLocaleString("fa-IR")} تومان`, status: view.paidInstallments > 0 ? "complete" : "upcoming" },
    { key: "investment", label: "سرمایه‌گذاری", date: firstInvestment ?? now, detail: view.positions.length ? `${view.positions.length.toLocaleString("fa-IR")} دارایی متصل` : "هنوز تراکنش متصل ثبت نشده است.", status: view.positions.length ? "complete" : "upcoming" },
    { key: "growth", label: "رشد دارایی", date: view.positions.find((position) => position.quoteAsOf)?.quoteAsOf ?? now, detail: view.linkedAssetPnlToman >= 0 ? "ارزش دارایی نسبت به بهای خرید مثبت است." : "ارزش دارایی نسبت به بهای خرید منفی است.", status: view.positions.length ? "current" : "upcoming" },
    { key: "settlement", label: "تسویه", date: view.loan.status === "closed" ? view.loan.updatedAt : view.loan.firstPaymentAt, detail: view.loan.status === "closed" ? "وام بسته شده است." : "پس از تکمیل اقساط.", status: view.loan.status === "closed" ? "complete" : "upcoming" },
  ];
}

function estimateMonthlyIncome(incomes: readonly IncomeEvent[]) {
  if (!incomes.length) return null;
  const recent = incomes.filter((income) => Date.now() - new Date(income.happenedAt).getTime() <= 183 * 86_400_000);
  const rows = recent.length ? recent : incomes;
  return rows.reduce((sum, income) => sum + income.amountToman, 0) / Math.max(1, new Set(rows.map((income) => income.happenedAt.slice(0, 7))).size);
}

function healthMessage(score: number, reserve: number, installmentToIncome: number | null) {
  if (score >= 70) return reserve >= 3 ? "ذخیره کافی برای اقساط دارید." : "وضعیت وام مناسب است؛ ذخیره را کامل نگه دارید.";
  if (score >= 45) return "در صورت افت بازار یا کاهش درآمد نیاز به بررسی دارد.";
  return installmentToIncome && installmentToIncome > 35 ? "بخش زیادی از جریان نقدی درگیر وام است." : "تعهد وام یا پوشش دارایی نیازمند اقدام است.";
}
