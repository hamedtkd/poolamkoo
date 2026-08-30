import assert from "node:assert/strict";
import test from "node:test";
import { auditLocalData, type DataHealthInput } from "../lib/data-health.ts";
import type { AllocationRule, Asset, FundMovement, GoalFund, IncomeEvent, InvestmentTransaction, MarketAlert, MarketWatchItem, PlanItem } from "../lib/types.ts";

const now = "2026-08-30T10:00:00.000Z";
const day = "2026-08-30";
const rule: AllocationRule = { id: 1, name: "متعادل", preset: "balanced", lifePct: 30, safetyPct: 20, growthPct: 50, isActive: true, createdAt: now, updatedAt: now };
const income: IncomeEvent = { id: 1, amountToman: 100, title: "ورودی", happenedAt: day, createdAt: now };
const fund: GoalFund = { id: 1, name: "اضطراری", targetToman: 1_000, currentToman: 100, icon: "shield", category: "emergency", createdAt: now, updatedAt: now };
const movement: FundMovement = { id: 1, fundId: 1, type: "deposit", source: "manual", amountToman: 100, happenedAt: day, createdAt: now, updatedAt: now };
const asset: Asset = { id: 1, name: "دارایی", kind: "custom", targetPct: 100, manualPriceToman: 100, icon: "pie", archived: false, createdAt: now, updatedAt: now };
const plan: PlanItem = { id: 1, incomeId: 1, bucket: "growth", targetType: "asset", targetId: 1, label: "خرید", plannedToman: 100, executedToman: 100, createdAt: now, updatedAt: now };
const transaction: InvestmentTransaction = { id: 1, assetId: 1, type: "buy", amountToman: 100, quantity: 1, unitPriceToman: 100, happenedAt: day, incomeId: 1, planItemId: 1, createdAt: now };
const watch: MarketWatchItem = { id: 1, marketId: "1", symbol: "AAA", name: "A", source: "tsetmc", createdAt: now, updatedAt: now };
const alert: MarketAlert = { id: 1, marketId: "1", symbol: "AAA", name: "A", source: "tsetmc", kind: "price_above", threshold: 100, enabled: true, notifyBrowser: false, armed: true, createdAt: now, updatedAt: now };

function healthy(): DataHealthInput {
  return {
    allocationRules: [rule], incomes: [income], allocations: [{ id: 1, incomeId: 1, bucket: "growth", amountToman: 100, createdAt: now }],
    funds: [fund], fundMovements: [movement], assets: [asset], transactions: [transaction], planItems: [plan], marketWatchlist: [watch], marketAlerts: [alert],
  };
}

function codes(input: DataHealthInput) {
  return auditLocalData(input, now).issues.map((row) => row.code);
}

test("healthy local financial data produces a clean audit", () => {
  const report = auditLocalData(healthy(), now);
  assert.equal(report.status, "healthy");
  assert.equal(report.issues.length, 0);
  assert.equal(report.repairable, 0);
});

test("fund display balance drift is repairable only when its ledger is valid", () => {
  const data = healthy();
  data.funds = [{ ...fund, currentToman: 90 }];
  const report = auditLocalData(data, now);
  assert.equal(report.status, "attention");
  assert.equal(report.repairable, 1);
  assert.equal(report.issues[0]?.code, "fund_balance_mismatch");
});

test("negative or missing fund history is critical and not auto repairable", () => {
  const negative = healthy();
  negative.fundMovements = [{ ...movement, type: "withdraw", amountToman: 200 }];
  assert.ok(codes(negative).includes("fund_negative_history"));
  const missing = healthy();
  missing.fundMovements = [];
  assert.ok(codes(missing).includes("fund_missing_ledger"));
  assert.equal(auditLocalData(missing, now).repairable, 0);
});

test("investment ledger catches a historical sell before inventory exists", () => {
  const data = healthy();
  data.transactions = [
    { ...transaction, id: 2, type: "sell", happenedAt: "2026-08-01", createdAt: "2026-08-01T10:00:00.000Z", planItemId: undefined, amountToman: 50, quantity: 1 },
    { ...transaction, happenedAt: "2026-08-02", createdAt: "2026-08-02T10:00:00.000Z" },
  ];
  assert.ok(codes(data).includes("investment_negative_history"));
});

test("orphan links and mismatched plan targets are surfaced instead of silently repaired", () => {
  const data = healthy();
  data.transactions = [{ ...transaction, assetId: 9, incomeId: 7, planItemId: 1 }];
  const result = codes(data);
  assert.ok(result.includes("orphan_transaction_asset"));
  assert.ok(result.includes("orphan_transaction_income"));
  assert.ok(result.includes("transaction_plan_target_mismatch"));
});

test("archived assets with open holdings stay visible as a health warning", () => {
  const data = healthy();
  data.assets = [{ ...asset, archived: true }];
  const report = auditLocalData(data, now);
  assert.ok(report.issues.some((row) => row.code === "archived_open_holding" && row.severity === "warning"));
});

test("investment plan execution drift can be rebuilt from linked buys", () => {
  const data = healthy();
  data.planItems = [{ ...plan, executedToman: 40 }];
  const report = auditLocalData(data, now);
  const mismatch = report.issues.find((row) => row.code === "investment_plan_execution_mismatch");
  assert.equal(mismatch?.repairable, true);
});

test("unlinked historical investment execution is reported but never auto repaired", () => {
  const data = healthy();
  data.transactions = [];
  data.planItems = [{ ...plan, executedToman: 40 }];
  const report = auditLocalData(data, now);
  const warning = report.issues.find((row) => row.code === "investment_plan_execution_unverifiable");
  assert.equal(warning?.repairable, false);
  assert.equal(report.repairable, 0);
});

test("plan overruns and missing targets remain critical manual-review issues", () => {
  const data = healthy();
  data.planItems = [{ ...plan, plannedToman: 50, executedToman: 100, targetId: 9 }];
  const result = codes(data);
  assert.ok(result.includes("plan_execution_overrun"));
  assert.ok(result.includes("orphan_plan_target"));
});

test("duplicate market identities and alerts are reported locally", () => {
  const data = healthy();
  data.marketWatchlist = [watch, { ...watch, id: 2 }];
  data.marketAlerts = [alert, { ...alert, id: 2 }];
  const result = codes(data);
  assert.ok(result.includes("duplicate_watchlist_identity"));
  assert.ok(result.includes("duplicate_market_alert"));
});

test("missing or multiple active money rules are warnings rather than destructive repairs", () => {
  const missing = healthy();
  missing.allocationRules = [{ ...rule, isActive: false }];
  assert.ok(codes(missing).includes("active_rule_missing"));
  const multiple = healthy();
  multiple.allocationRules = [rule, { ...rule, id: 2 }];
  assert.ok(codes(multiple).includes("active_rule_multiple"));
});
