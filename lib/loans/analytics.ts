import { portfolioPosition } from "../calculations.ts";
import { transactionBuyCost, transactionSellProceeds } from "../investment-lots.ts";
import { assetMarketFreshness } from "../market/freshness.ts";
import { marketQuoteForAsset, resolveAssetValuation, valuationPriceSourceLabel } from "../market/valuation.ts";
import type { Asset, FundMovement, GoalFund, InvestmentTransaction, Loan, LoanPayment, MarketQuote } from "../types.ts";
import { loanBreakEvenAnnualRate, loanContractInstallment, loanOutstandingPrincipal, loanReserveRunway, loanReserveTarget } from "./calculations.ts";
import { annualizedMoneyWeightedReturn } from "./returns.ts";
import { nextLoanInstallment, paidLoanInstallmentCount } from "./schedule.ts";

export type LoanAssetPosition = {
  asset: Asset;
  openCostToman: number;
  currentValueToman: number;
  pnlToman: number;
  unrealizedPnlToman: number;
  realizedPnlToman: number;
  openQuantity: number;
  returnPct: number;
  pricingAvailable: boolean;
  pricingFresh: boolean;
  automaticRiskReady: boolean;
  marketQuoteExpected: boolean;
  marketFreshnessState: "fresh" | "stale" | "unavailable" | "not-applicable";
  marketQuoteAgeHours: number | null;
  marketFreshnessLimitHours: number;
  quoteAsOf?: string;
  annualizedReturnPct?: number;
  returnObservationDays?: number;
  spreadVsLoanCostPct?: number;
  priceSourceLabel: string;
};

export type LoanView = {
  loan: Loan;
  installmentToman: number;
  loanEffectiveCostPct: number;
  paidInstallments: number;
  paidToman: number;
  externalContributionsToman: number;
  nextInstallment: ReturnType<typeof nextLoanInstallment>;
  outstandingPrincipalToman: number;
  reserveBalanceToman: number;
  reserveTargetToman: number;
  reserveRunwayMonths: number;
  reserveProgressPct: number;
  linkedAssetValueToman: number;
  linkedAssetCostToman: number;
  linkedAssetPnlToman: number;
  loanCashToman: number;
  fundingGapToman: number;
  positions: LoanAssetPosition[];
  strategyAssetsToman: number;
  grossLoanEquityToman: number;
  netStrategyEffectToman: number;
  overdue: boolean;
  needsAttention: boolean;
};

function loanPositions(loan: Loan, assets: readonly Asset[], transactions: readonly InvestmentTransaction[], quotes: readonly MarketQuote[], loanCostPct: number, today: Date) {
  const linked = transactions.filter((row) => row.loanId === loan.id);
  const assetIds = new Set(linked.map((row) => row.assetId));
  return assets.filter((asset) => asset.id && assetIds.has(asset.id)).map((asset): LoanAssetPosition => {
    const rows = linked.filter((row) => row.assetId === asset.id);
    const quote = marketQuoteForAsset(asset, quotes);
    const valuation = resolveAssetValuation(asset, quotes);
    const freshness = assetMarketFreshness(asset, quote, today);
    const position = portfolioPosition(asset, rows, valuation.price);
    const terminalAt = freshness.asOf ?? today.toISOString();
    const annualized = position.qty > 1e-10 && freshness.automaticRiskReady
      ? annualizedMoneyWeightedReturn(rows, position.currentValue, terminalAt)
      : null;
    const spread = asset.kind === "fund" && annualized
      ? annualized.annualizedReturnPct - loanCostPct
      : undefined;
    return {
      asset,
      openCostToman: position.cost,
      currentValueToman: position.currentValue,
      pnlToman: position.unrealized + position.realized,
      unrealizedPnlToman: position.unrealized,
      realizedPnlToman: position.realized,
      openQuantity: position.qty,
      returnPct: position.returnPct,
      pricingAvailable: position.valuationAvailable,
      pricingFresh: valuation.source === "manual" || freshness.state === "fresh",
      automaticRiskReady: freshness.automaticRiskReady,
      marketQuoteExpected: freshness.expected,
      marketFreshnessState: freshness.state,
      marketQuoteAgeHours: freshness.ageHours,
      marketFreshnessLimitHours: freshness.maxAgeHours,
      quoteAsOf: freshness.asOf,
      annualizedReturnPct: annualized?.annualizedReturnPct,
      returnObservationDays: annualized?.observationDays,
      spreadVsLoanCostPct: spread,
      priceSourceLabel: valuationPriceSourceLabel(valuation.source),
    };
  });
}

export function buildLoanView(input: {
  loan: Loan;
  payments: readonly LoanPayment[];
  funds: readonly GoalFund[];
  assets: readonly Asset[];
  transactions: readonly InvestmentTransaction[];
  quotes: readonly MarketQuote[];
  fundMovements?: readonly FundMovement[];
  today?: Date;
}): LoanView {
  const { loan, payments, funds, assets, transactions, quotes } = input;
  const today = input.today ?? new Date();
  const relatedPayments = payments.filter((row) => row.loanId === loan.id);
  const paidInstallments = paidLoanInstallmentCount(loan, relatedPayments);
  const installmentToman = loanContractInstallment(loan);
  const loanEffectiveCostPct = loanBreakEvenAnnualRate(loan);
  const reserveFund = funds.find((fund) => fund.id === loan.reserveFundId);
  const reserveBalanceToman = Math.max(0, reserveFund?.currentToman ?? 0);
  const reserveTargetToman = loanReserveTarget(installmentToman, loan.reserveTargetMonths);
  const reserveRunwayMonths = loanReserveRunway(reserveBalanceToman, installmentToman);
  const positions = loanPositions(loan, assets, transactions, quotes, loanEffectiveCostPct, today);
  const linkedAssetValueToman = positions.reduce((sum, row) => sum + row.currentValueToman, 0);
  const linkedAssetCostToman = positions.reduce((sum, row) => sum + row.openCostToman, 0);
  const linkedAssetPnlToman = positions.reduce((sum, row) => sum + row.pnlToman, 0);
  const outstandingPrincipalToman = loanOutstandingPrincipal(loan, paidInstallments);
  const linkedTransactions = transactions.filter((row) => row.loanId === loan.id);
  const loanReserveFundingToman = (input.fundMovements ?? [])
    .filter((row) => row.loanId === loan.id && row.source === "loan_reserve" && row.type === "deposit")
    .reduce((sum, row) => sum + row.amountToman, 0);
  const buyCashOutToman = linkedTransactions.filter((row) => row.type === "buy").reduce((sum, row) => sum + transactionBuyCost(row), 0);
  const sellCashInToman = linkedTransactions.filter((row) => row.type === "sell").reduce((sum, row) => sum + transactionSellProceeds(row), 0);
  const assetSalePaymentToman = relatedPayments.reduce((sum, row) => sum + row.assetSaleToman, 0);
  const rawLoanCashToman = loan.principalToman - (loan.upfrontCostsToman ?? 0) - loanReserveFundingToman - buyCashOutToman + sellCashInToman - assetSalePaymentToman;
  const loanCashToman = Math.max(0, rawLoanCashToman);
  const fundingGapToman = Math.max(0, -rawLoanCashToman);
  const strategyAssetsToman = reserveBalanceToman + linkedAssetValueToman + loanCashToman;
  const externalReserveDepositsToman = (input.fundMovements ?? [])
    .filter((row) => row.loanId === loan.id && row.source === "manual" && row.type === "deposit")
    .reduce((sum, row) => sum + row.amountToman, 0);
  const externalContributionsToman = relatedPayments.reduce((sum, row) => sum + row.externalToman, 0) + externalReserveDepositsToman + fundingGapToman;
  const nextInstallment = nextLoanInstallment(loan, relatedPayments, today);
  const grossLoanEquityToman = strategyAssetsToman - outstandingPrincipalToman;
  const netStrategyEffectToman = grossLoanEquityToman - externalContributionsToman;
  const overdue = Boolean(nextInstallment && nextInstallment.daysRemaining < 0);
  const reserveProgressPct = reserveTargetToman > 0 ? Math.min(100, reserveBalanceToman / reserveTargetToman * 100) : 100;
  const needsAttention = overdue || fundingGapToman > 0.5 || reserveRunwayMonths < Math.min(3, loan.reserveTargetMonths || 3);
  return {
    loan, installmentToman, loanEffectiveCostPct, paidInstallments,
    paidToman: relatedPayments.reduce((sum, row) => sum + row.amountToman, 0),
    externalContributionsToman, nextInstallment, outstandingPrincipalToman,
    reserveBalanceToman, reserveTargetToman, reserveRunwayMonths, reserveProgressPct,
    linkedAssetValueToman, linkedAssetCostToman, linkedAssetPnlToman, loanCashToman, fundingGapToman, positions,
    strategyAssetsToman, grossLoanEquityToman, netStrategyEffectToman, overdue, needsAttention,
  };
}

export function buildLoanViews(input: Omit<Parameters<typeof buildLoanView>[0], "loan"> & { loans: readonly Loan[] }) {
  return input.loans.map((loan) => buildLoanView({ ...input, loan }));
}
