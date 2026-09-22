import { normalizeSearchText } from "./search.ts";
import type { Asset, FundMovement, GoalFund, IncomeEvent, InvestmentTransaction, Loan, LoanPayment } from "./types.ts";

export type FinancialActivityCategory = "income" | "fund" | "investment" | "loan";
export type FinancialActivityAction =
  | "income_received"
  | "fund_deposit"
  | "fund_withdraw"
  | "fund_opening"
  | "investment_buy"
  | "investment_sell"
  | "loan_payment";

export interface FinancialActivityItem {
  id: string;
  category: FinancialActivityCategory;
  action: FinancialActivityAction;
  happenedAt: string;
  createdAt: string;
  title: string;
  detail: string;
  amountToman: number;
  note?: string;
  sourceLabel?: string;
  href: string;
  searchText: string;
}

export interface FinancialActivitySummary {
  eventCount: number;
  incomeTotal: number;
  fundTurnover: number;
  investmentTurnover: number;
  loanPaymentsTotal: number;
}

export function buildFinancialActivity({ incomes, funds, fundMovements, assets, transactions, loans = [], loanPayments = [] }: {
  incomes: IncomeEvent[];
  funds: GoalFund[];
  fundMovements: FundMovement[];
  assets: Asset[];
  transactions: InvestmentTransaction[];
  loans?: Loan[];
  loanPayments?: LoanPayment[];
}) {
  const fundById = new Map(funds.flatMap((fund) => fund.id ? [[fund.id, fund] as const] : []));
  const assetById = new Map(assets.flatMap((asset) => asset.id ? [[asset.id, asset] as const] : []));
  const loanById = new Map(loans.flatMap((loan) => loan.id ? [[loan.id, loan] as const] : []));

  const incomeRows: FinancialActivityItem[] = incomes.map((income) => ({
    id: `income:${income.id ?? income.createdAt}`,
    category: "income",
    action: "income_received",
    happenedAt: dayKey(income.happenedAt),
    createdAt: income.createdAt,
    title: income.title || "پول ورودی",
    detail: "پول ورودی ثبت شد",
    amountToman: safeAmount(income.amountToman),
    note: cleanNote(income.note),
    href: income.id ? `/income?plan=${income.id}` : "/income",
    searchText: activitySearchText([income.title, income.note, "پول ورودی درآمد"]),
  }));

  const fundRows: FinancialActivityItem[] = fundMovements.map((movement) => {
    const fund = fundById.get(movement.fundId);
    const action = fundAction(movement.type);
    const sourceLabel = fundMovementSourceLabel(movement.source);
    return {
      id: `fund:${movement.id ?? `${movement.fundId}:${movement.createdAt}`}`,
      category: "fund",
      action,
      happenedAt: dayKey(movement.happenedAt),
      createdAt: movement.createdAt,
      title: fund?.name ?? "صندوق نامشخص",
      detail: fundActionLabel(action),
      amountToman: safeAmount(movement.amountToman),
      note: cleanNote(movement.note),
      sourceLabel,
      href: "/funds",
      searchText: activitySearchText([fund?.name, movement.note, sourceLabel, fundActionLabel(action), "صندوق"]),
    };
  });

  const investmentRows: FinancialActivityItem[] = transactions.map((transaction) => {
    const asset = assetById.get(transaction.assetId);
    const action: FinancialActivityAction = transaction.type === "sell" ? "investment_sell" : "investment_buy";
    const label = action === "investment_sell" ? "فروش سرمایه‌گذاری" : "خرید سرمایه‌گذاری";
    return {
      id: `investment:${transaction.id ?? `${transaction.assetId}:${transaction.createdAt}`}`,
      category: "investment",
      action,
      happenedAt: dayKey(transaction.happenedAt),
      createdAt: transaction.createdAt,
      title: asset?.name ?? "دارایی نامشخص",
      detail: label,
      amountToman: safeAmount(transaction.amountToman),
      note: cleanNote(transaction.note),
      sourceLabel: transaction.planItemId ? "اجرای برنامه" : transaction.incomeId ? "متصل به پول ورودی" : undefined,
      href: "/investments",
      searchText: activitySearchText([asset?.name, asset?.symbol, transaction.note, label, "سرمایه گذاری خرید فروش"]),
    };
  });

  const loanRows: FinancialActivityItem[] = loanPayments.map((payment) => {
    const loan = loanById.get(payment.loanId);
    const sourceLabel = loanPaymentSourceLabel(payment);
    return {
      id: `loan:${payment.id ?? `${payment.loanId}:${payment.installmentNo}:${payment.createdAt}`}`,
      category: "loan",
      action: "loan_payment",
      happenedAt: dayKey(payment.paidAt),
      createdAt: payment.createdAt,
      title: loan?.name ?? "وام نامشخص",
      detail: `پرداخت قسط ${payment.installmentNo.toLocaleString("fa-IR")}`,
      amountToman: safeAmount(payment.amountToman),
      note: cleanNote(payment.note),
      sourceLabel,
      href: loan?.id ? `/loans/${loan.id}` : "/loans",
      searchText: activitySearchText([loan?.name, loan?.lender, payment.note, sourceLabel, "وام قسط بازپرداخت"]),
    };
  });

  return sortFinancialActivity([...incomeRows, ...fundRows, ...investmentRows, ...loanRows]);
}

export function filterFinancialActivity(rows: FinancialActivityItem[], category: FinancialActivityCategory | "all", query: string) {
  const normalized = normalizeSearchText(query);
  return rows.filter((row) => {
    if (category !== "all" && row.category !== category) return false;
    return !normalized || row.searchText.includes(normalized);
  });
}

export function summarizeFinancialActivity(rows: FinancialActivityItem[]): FinancialActivitySummary {
  return rows.reduce<FinancialActivitySummary>((summary, row) => {
    summary.eventCount += 1;
    if (row.category === "income") summary.incomeTotal += row.amountToman;
    if (row.category === "fund") summary.fundTurnover += row.amountToman;
    if (row.category === "investment") summary.investmentTurnover += row.amountToman;
    if (row.category === "loan") summary.loanPaymentsTotal += row.amountToman;
    return summary;
  }, { eventCount: 0, incomeTotal: 0, fundTurnover: 0, investmentTurnover: 0, loanPaymentsTotal: 0 });
}

export function groupFinancialActivityByDay(rows: FinancialActivityItem[]) {
  const groups: Array<{ day: string; items: FinancialActivityItem[] }> = [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (last?.day === row.happenedAt) last.items.push(row);
    else groups.push({ day: row.happenedAt, items: [row] });
  }
  return groups;
}

export function fundMovementSourceLabel(source: FundMovement["source"]) {
  const labels: Record<FundMovement["source"], string> = {
    manual: "دستی",
    opening: "موجودی آغازین",
    plan: "اجرای برنامه",
    direct: "کنارگذاری مستقیم",
    income_reversal: "برگشت حذف ورودی",
    loan_reserve: "ذخیره اولیه وام",
    loan_payment: "پرداخت قسط وام",
    migration: "انتقال از نسخه قدیمی",
  };
  return labels[source];
}

function loanPaymentSourceLabel(payment: LoanPayment) {
  if (payment.source === "reserve") return "ذخیره اقساط";
  if (payment.source === "external") return "پول شخصی";
  if (payment.source === "asset_sale") return "فروش دارایی";
  return "ترکیبی";
}

function sortFinancialActivity(rows: FinancialActivityItem[]) {
  return [...rows].sort((a, b) => {
    const day = b.happenedAt.localeCompare(a.happenedAt);
    if (day) return day;
    const created = b.createdAt.localeCompare(a.createdAt);
    if (created) return created;
    return a.id.localeCompare(b.id);
  });
}

function fundAction(type: FundMovement["type"]): FinancialActivityAction {
  if (type === "withdraw") return "fund_withdraw";
  if (type === "opening") return "fund_opening";
  return "fund_deposit";
}

function fundActionLabel(action: FinancialActivityAction) {
  if (action === "fund_withdraw") return "برداشت از صندوق";
  if (action === "fund_opening") return "موجودی آغازین صندوق";
  return "واریز به صندوق";
}

function safeAmount(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function dayKey(value: string) {
  return value.slice(0, 10);
}

function cleanNote(note?: string) {
  const value = note?.trim();
  return value || undefined;
}

function activitySearchText(parts: Array<string | undefined>) {
  return normalizeSearchText(parts.filter(Boolean).join(" "));
}
