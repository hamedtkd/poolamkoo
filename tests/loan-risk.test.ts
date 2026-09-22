import assert from "node:assert/strict";
import test from "node:test";
import { buildLoanView } from "../lib/loans/analytics.ts";
import { loanContractInstallment } from "../lib/loans/calculations.ts";
import { buildLoanHealthSummary, loanRiskObservedValue, loanRiskTransition } from "../lib/loans/risk.ts";
import { defaultLoanRiskPolicy } from "../lib/loans/risk-policy.ts";
import type { Asset, GoalFund, InvestmentTransaction, Loan, LoanRiskAlert, MarketQuote } from "../lib/types.ts";

const now = "2026-09-21T00:00:00.000Z";
const loan: Loan = {
  id: 7,
  name: "وام ودیعه",
  principalToman: 280_000_000,
  nominalAnnualRatePct: 23,
  termMonths: 60,
  disbursedAt: "2026-09-01",
  firstPaymentAt: "2026-10-01",
  reserveTargetMonths: 6,
  reserveFundId: 3,
  riskBudgetInstallments: 2,
  reminderDays: [7, 3, 1, 0],
  notifyBrowser: true,
  status: "active",
  createdAt: now,
  updatedAt: now,
};
const installment = loanContractInstallment(loan);
const gold: Asset = { id: 10, name: "طلا", kind: "gold", symbol: "IR_GOLD_18K", targetPct: 0, icon: "gold", archived: false, createdAt: now, updatedAt: now };
const buyGold: InvestmentTransaction = { id: 1, assetId: 10, loanId: 7, type: "buy", amountToman: 100_000_000, quantity: 100, unitPriceToman: 1_000_000, happenedAt: "2026-09-10", createdAt: now };
const buyDollar: InvestmentTransaction = { id: 2, assetId: 11, loanId: 7, type: "buy", amountToman: 50_000_000, quantity: 50, unitPriceToman: 1_000_000, happenedAt: "2026-09-10", createdAt: now };
const sellDollar: InvestmentTransaction = { id: 3, assetId: 11, loanId: 7, type: "sell", amountToman: 50_000_000, quantity: 50, unitPriceToman: 1_000_000, happenedAt: "2026-09-12", createdAt: now };

function alert(overrides: Partial<LoanRiskAlert> = {}): LoanRiskAlert {
  return {
    id: 1,
    loanId: 7,
    kind: "reserve_runway_below",
    threshold: 3,
    rearmThreshold: 4,
    enabled: true,
    armed: true,
    notifyBrowser: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function quote(priceToman: number, runtimeSource: "live" | "snapshot" = "live"): MarketQuote {
  return { symbol: "IR_GOLD_18K", name: "طلا", priceToman, changePercent: 0, changeValueToman: 0, asOf: now, source: "tindex", runtimeSource };
}

function view(reserveInstallments: number, quotes: MarketQuote[] = [quote(800_000)]) {
  const fund: GoalFund = { id: 3, name: "ذخیره", targetToman: installment * 6, currentToman: installment * reserveInstallments, icon: "shield", category: "custom", createdAt: now, updatedAt: now };
  return buildLoanView({ loan, payments: [], funds: [fund], assets: [gold], transactions: [buyGold], quotes, today: new Date(now) });
}

test("default risk policy creates reserve and open-position alerts only", () => {
  const rows = defaultLoanRiskPolicy([loan], [buyGold, buyDollar, sellDollar]);
  assert.equal(rows.length, 2);
  const reserve = rows.find((row) => row.kind === "reserve_runway_below");
  const loss = rows.find((row) => row.kind === "loss_budget_exceeded");
  assert.equal(reserve?.threshold, 3);
  assert.equal(reserve?.rearmThreshold, 4);
  assert.equal(loss?.assetId, 10);
  assert.equal(loss?.threshold, 2);
  assert.equal(loss?.rearmThreshold, 1.6);
  assert.equal(rows.some((row) => row.assetId === 11), false);
});

test("reserve alert triggers below threshold and rearms only after hysteresis buffer", () => {
  assert.equal(loanRiskTransition(alert(), view(2.5)), "trigger");
  assert.equal(loanRiskTransition(alert({ armed: false }), view(3.5)), "none");
  assert.equal(loanRiskTransition(alert({ armed: false }), view(4)), "rearm");
});

test("loss budget is measured in installment units from unrealized loss", () => {
  const lossAlert = alert({ id: 2, assetId: 10, kind: "loss_budget_exceeded", threshold: 2, rearmThreshold: 1.6 });
  const risky = view(6, [quote(800_000)]);
  const observed = loanRiskObservedValue(lossAlert, risky);
  assert.ok(observed !== null && observed > 2.5 && observed < 2.6);
  assert.equal(loanRiskTransition(lossAlert, risky), "trigger");

  const recovered = view(6, [quote(880_000)]);
  assert.equal(loanRiskTransition({ ...lossAlert, armed: false }, recovered), "rearm");
});

test("snapshot market value never fires an automatic loss-budget alert", () => {
  const lossAlert = alert({ id: 2, assetId: 10, kind: "loss_budget_exceeded", threshold: 2, rearmThreshold: 1.6 });
  const stale = view(6, [quote(700_000, "snapshot")]);
  assert.equal(loanRiskObservedValue(lossAlert, stale), null);
  assert.equal(loanRiskTransition(lossAlert, stale), "unavailable");
});

test("health summary distinguishes critical, watch and healthy states", () => {
  const reserveAlert = alert();
  const critical = buildLoanHealthSummary(view(2), [reserveAlert]);
  assert.equal(critical.level, "critical");
  assert.equal(critical.triggeredCount, 1);

  const watch = buildLoanHealthSummary(view(3.5), [reserveAlert]);
  assert.equal(watch.level, "watch");
  assert.equal(watch.watchCount, 1);

  const healthy = buildLoanHealthSummary(view(6), [reserveAlert]);
  assert.equal(healthy.level, "healthy");
});

test("closed loans do not receive managed risk policy", () => {
  assert.deepEqual(defaultLoanRiskPolicy([{ ...loan, status: "closed" }], [buyGold]), []);
});


test("phase 4.3 policy adds quote freshness for market-backed open positions", () => {
  const rows = defaultLoanRiskPolicy([loan], [buyGold], [gold]);
  const freshness = rows.find((row) => row.kind === "quote_stale");
  assert.equal(freshness?.assetId, 10);
  assert.ok((freshness?.threshold ?? 0) > 0);
});

test("old live quotes are not decision-ready for automatic loss alerts", () => {
  const lossAlert = alert({ id: 2, assetId: 10, kind: "loss_budget_exceeded", threshold: 2, rearmThreshold: 1.6 });
  const oldQuote = { ...quote(700_000), asOf: "2026-09-20T00:00:00.000Z" };
  const stale = view(6, [oldQuote]);
  assert.equal(loanRiskObservedValue(lossAlert, stale), null);
  assert.equal(loanRiskTransition(lossAlert, stale), "unavailable");
});

test("quote stale alert triggers on old live data and rearms after a fresh quote", () => {
  const staleAlert = alert({ id: 3, assetId: 10, kind: "quote_stale", threshold: 8, rearmThreshold: 4 });
  const oldQuote = { ...quote(800_000), asOf: "2026-09-20T00:00:00.000Z" };
  assert.equal(loanRiskTransition(staleAlert, view(6, [oldQuote])), "trigger");
  assert.equal(loanRiskTransition({ ...staleAlert, armed: false }, view(6, [quote(800_000)])), "rearm");
});

test("fund spread compares observed annualized return with effective loan cost", () => {
  const fundAsset: Asset = {
    id: 12, name: "Income fund", kind: "fund", symbol: "FUND", marketId: "fund-12", marketSource: "tindex",
    targetPct: 0, icon: "fund", archived: false, createdAt: now, updatedAt: now,
  };
  const fundBuy: InvestmentTransaction = {
    id: 4, assetId: 12, loanId: 7, type: "buy", amountToman: 100_000_000, quantity: 100_000,
    unitPriceToman: 1_000, happenedAt: "2025-09-21T00:00:00.000Z", createdAt: now,
  };
  const fundQuote: MarketQuote = {
    marketId: "fund-12", marketSource: "tindex", symbol: "FUND", name: "Income fund", priceToman: 1_100,
    changePercent: 0, changeValueToman: 0, asOf: now, source: "tindex", runtimeSource: "live",
  };
  const fundView = buildLoanView({ loan, payments: [], funds: [], assets: [fundAsset], transactions: [fundBuy], quotes: [fundQuote], today: new Date(now) });
  const spreadAlert = alert({ id: 4, assetId: 12, kind: "spread_below", threshold: 0, rearmThreshold: 2 });
  const position = fundView.positions[0];
  assert.ok((position.returnObservationDays ?? 0) >= 365);
  assert.ok((position.annualizedReturnPct ?? 0) > 9 && (position.annualizedReturnPct ?? 0) < 11);
  assert.ok((position.spreadVsLoanCostPct ?? 0) < 0);
  assert.equal(loanRiskTransition(spreadAlert, fundView), "trigger");
});
