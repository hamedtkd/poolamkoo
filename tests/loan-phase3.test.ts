import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildLoanView } from "../lib/loans/analytics.ts";
import { loanContractInstallment } from "../lib/loans/calculations.ts";
import { nextLoanInstallment } from "../lib/loans/schedule.ts";
import type { Asset, FundMovement, GoalFund, InvestmentTransaction, Loan, LoanPayment, MarketQuote } from "../lib/types.ts";

const now = "2026-09-21T00:00:00.000Z";
const loan: Loan = {
  id: 1, name: "وام ودیعه", principalToman: 280_000_000, nominalAnnualRatePct: 23, termMonths: 60,
  disbursedAt: "2026-09-01", firstPaymentAt: "2026-10-01", reserveTargetMonths: 6, reserveFundId: 1,
  riskBudgetInstallments: 2, reminderDays: [7, 3, 1, 0], notifyBrowser: false, status: "active", createdAt: now, updatedAt: now,
};
const installment = loanContractInstallment(loan);
const payment: LoanPayment = {
  id: 1, loanId: 1, installmentNo: 1, dueAt: "2026-10-01", amountToman: installment, paidAt: "2026-10-01",
  source: "external", reserveToman: 0, externalToman: installment, assetSaleToman: 0, createdAt: now, updatedAt: now,
};
const fund: GoalFund = { id: 1, name: "ذخیره اقساط", targetToman: installment * 6, currentToman: 50_000_000, icon: "shield", category: "custom", createdAt: now, updatedAt: now };
const fundMovements: FundMovement[] = [
  { id: 1, fundId: 1, type: "deposit", source: "loan_reserve", amountToman: 47_000_000, happenedAt: "2026-09-01", loanId: 1, createdAt: now, updatedAt: now },
  { id: 2, fundId: 1, type: "deposit", source: "manual", amountToman: 10_000_000, happenedAt: "2026-10-15", loanId: 1, createdAt: now, updatedAt: now },
];

test("loan schedule selects the first unpaid installment and keeps calendar due dates", () => {
  const next = nextLoanInstallment(loan, [payment], new Date("2026-10-15T12:00:00Z"));
  assert.equal(next?.installmentNo, 2);
  assert.equal(next?.dueAt, "2026-11-01");
  assert.equal(next?.amountToman, installment);
});

test("loan analytics subtracts personal reserve top-ups without treating the original loan reserve as external money", () => {
  const view = buildLoanView({ loan, payments: [payment], funds: [fund], fundMovements, assets: [], transactions: [], quotes: [], today: new Date("2026-10-15T12:00:00Z") });
  assert.ok(Math.abs(view.externalContributionsToman - (installment + 10_000_000)) < 1);
  assert.equal(view.reserveBalanceToman, 50_000_000);
  assert.ok(view.reserveRunwayMonths > 6);
  assert.equal(view.positions.length, 0);
});



test("loan analytics keeps traceable loan cash inside strategy assets", () => {
  const cleanFund = { ...fund, currentToman: 47_000_000 };
  const cleanMovements = [fundMovements[0]];
  const initial = buildLoanView({ loan, payments: [], funds: [cleanFund], fundMovements: cleanMovements, assets: [], transactions: [], quotes: [] });
  assert.equal(initial.loanCashToman, 233_000_000);
  assert.equal(initial.strategyAssetsToman, 280_000_000);
  assert.ok(Math.abs(initial.netStrategyEffectToman) < 1);

  const asset: Asset = { id: 9, name: "طلا", kind: "gold", targetPct: 0, manualPriceToman: 110_000_000, icon: "gold", archived: false, createdAt: now, updatedAt: now };
  const buy: InvestmentTransaction = { id: 10, assetId: 9, loanId: 1, type: "buy", amountToman: 100_000_000, quantity: 1, unitPriceToman: 100_000_000, happenedAt: "2026-09-10", createdAt: now };
  const invested = buildLoanView({ loan, payments: [], funds: [cleanFund], fundMovements: cleanMovements, assets: [asset], transactions: [buy], quotes: [] });
  assert.equal(invested.loanCashToman, 133_000_000);
  assert.equal(invested.linkedAssetValueToman, 110_000_000);
  assert.equal(invested.netStrategyEffectToman, 10_000_000);
});

test("loan analytics treats over-funded linked buys as personal funding instead of fake profit", () => {
  const cleanFund = { ...fund, currentToman: 47_000_000 };
  const asset: Asset = { id: 9, name: "طلا", kind: "gold", targetPct: 0, manualPriceToman: 300_000_000, icon: "gold", archived: false, createdAt: now, updatedAt: now };
  const buy: InvestmentTransaction = { id: 10, assetId: 9, loanId: 1, type: "buy", amountToman: 300_000_000, quantity: 1, unitPriceToman: 300_000_000, happenedAt: "2026-09-10", createdAt: now };
  const view = buildLoanView({ loan, payments: [], funds: [cleanFund], fundMovements: [fundMovements[0]], assets: [asset], transactions: [buy], quotes: [] });
  assert.equal(view.loanCashToman, 0);
  assert.equal(view.fundingGapToman, 67_000_000);
  assert.equal(view.externalContributionsToman, 67_000_000);
  assert.ok(Math.abs(view.netStrategyEffectToman) < 1);
});

test("loan analytics excludes empty positions and snapshot-only valuations from linked asset intelligence", () => {
  const asset: Asset = { id: 9, name: "سهام", kind: "stock", targetPct: 0, icon: "stock", archived: false, createdAt: now, updatedAt: now };
  const buy: InvestmentTransaction = { id: 10, assetId: 9, loanId: 1, type: "buy", amountToman: 100_000_000, quantity: 1, unitPriceToman: 100_000_000, happenedAt: "2026-09-10", createdAt: now };
  const sold: InvestmentTransaction = { id: 11, assetId: 9, loanId: 1, type: "sell", amountToman: 100_000_000, quantity: 1, unitPriceToman: 100_000_000, happenedAt: "2026-09-11", createdAt: now };
  const snapshot: MarketQuote = { symbol: "سهام", name: "سهام", priceToman: 120_000_000, changePercent: 0, changeValueToman: 0, asOf: "2026-09-21", source: "local", runtimeSource: "snapshot" };
  const emptyPosition = buildLoanView({ loan, payments: [], funds: [], assets: [asset], transactions: [buy, sold], quotes: [], today: new Date("2026-09-21T12:00:00Z") });
  const snapshotPosition = buildLoanView({ loan, payments: [], funds: [], assets: [asset], transactions: [buy], quotes: [snapshot], today: new Date("2026-09-21T12:00:00Z") });
  assert.equal(emptyPosition.linkedAssetValueToman, 0);
  assert.equal(emptyPosition.positions[0]?.status, "unavailable");
  assert.equal(snapshotPosition.linkedAssetValueToman, 0);
  assert.equal(snapshotPosition.positions[0]?.status, "unavailable");
});

test("phase 3 wires loans into workspace navigation, dashboard and offline shell", () => {
  const navigation = readFileSync(new URL("../components/app/navigation.ts", import.meta.url), "utf8");
  const dashboard = readFileSync(new URL("../app/(workspace)/dashboard/page.tsx", import.meta.url), "utf8");
  const worker = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(navigation, /href: "\/loans"/);
  assert.match(dashboard, /onOpenLoans/);
  assert.match(worker, /"\/loans"/);
});

test("phase 3 keeps loan funding separate from income and supports explicit loan links on investments", () => {
  const wizard = readFileSync(new URL("../components/loans/loan-wizard.tsx", import.meta.url), "utf8");
  const transaction = readFileSync(new URL("../components/investments/transaction-dialog.tsx", import.meta.url), "utf8");
  const setup = readFileSync(new URL("../lib/loans/setup.ts", import.meta.url), "utf8");
  assert.doesNotMatch(setup, /db\.incomes\.add/);
  assert.match(wizard, /createLoanSetup/);
  assert.match(transaction, /loanId:/);
});

test("phase 3 keeps existing reserve attribution auditable", () => {
  const wizard = readFileSync(new URL("../components/loans/loan-wizard.tsx", import.meta.url), "utf8");
  const editor = readFileSync(new URL("../components/loans/loan-editor.tsx", import.meta.url), "utf8");
  const setup = readFileSync(new URL("../lib/loans/setup.ts", import.meta.url), "utf8");
  assert.match(setup, /existingFund\.currentToman > 0\.5/);
  assert.match(wizard, /صندوق دارای موجودی در این نسخه قابل اتصال نیست/);
  assert.match(editor, /فقط صندوق خالی را به‌عنوان ذخیره جدید متصل کن/);
  assert.match(editor, /ابتدا موجودی صندوق فعلی را به شکل قابل ردیابی تسویه کن/);
  assert.doesNotMatch(wizard, /Notification\.requestPermission/);
  assert.doesNotMatch(editor, /Notification\.requestPermission/);
  const payments = readFileSync(new URL("../lib/loans/payments.ts", import.meta.url), "utf8");
  assert.match(payments, /row\?\.loanId !== payment\.loanId/);
});
