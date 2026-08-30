import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFinancialActivity,
  filterFinancialActivity,
  fundMovementSourceLabel,
  groupFinancialActivityByDay,
  summarizeFinancialActivity,
} from "../lib/activity.ts";
import type { Asset, FundMovement, GoalFund, IncomeEvent, InvestmentTransaction } from "../lib/types.ts";

const created = "2026-08-01T10:00:00.000Z";
const incomes: IncomeEvent[] = [
  { id: 1, amountToman: 1000, title: "حقوق مرداد", note: "شرکت", happenedAt: "2026-08-03", createdAt: "2026-08-03T08:00:00.000Z" },
];
const funds: GoalFund[] = [
  { id: 7, name: "اضطراری", targetToman: 5000, currentToman: 600, icon: "safe", category: "emergency", createdAt: created, updatedAt: created },
];
const assets: Asset[] = [
  { id: 9, name: "طلای شخصی", symbol: "GOLD", kind: "gold", targetPct: 50, icon: "gold", archived: true, createdAt: created, updatedAt: created },
];
const fundMovements: FundMovement[] = [
  { id: 2, fundId: 7, type: "deposit", source: "direct", amountToman: 300, happenedAt: "2026-08-03", note: "برای امنیت", createdAt: "2026-08-03T09:00:00.000Z", updatedAt: created },
  { id: 3, fundId: 7, type: "withdraw", source: "manual", amountToman: 50, happenedAt: "2026-08-02", createdAt: "2026-08-02T09:00:00.000Z", updatedAt: created },
];
const transactions: InvestmentTransaction[] = [
  { id: 4, assetId: 9, type: "buy", amountToman: 400, quantity: 2, unitPriceToman: 200, happenedAt: "2026-08-03", note: "خرید", incomeId: 1, planItemId: 10, createdAt: "2026-08-03T10:00:00.000Z" },
  { id: 5, assetId: 9, type: "sell", amountToman: 250, quantity: 1, unitPriceToman: 250, happenedAt: "2026-08-01", createdAt: "2026-08-01T10:00:00.000Z" },
];

function rows() {
  return buildFinancialActivity({ incomes, funds, fundMovements, assets, transactions });
}

test("unified activity merges income, fund and investment ledgers", () => {
  const activity = rows();
  assert.equal(activity.length, 5);
  assert.deepEqual(new Set(activity.map((row) => row.category)), new Set(["income", "fund", "investment"]));
});

test("activity sorts by financial day then recorded creation time without inventing an execution time", () => {
  const activity = rows();
  assert.deepEqual(activity.slice(0, 3).map((row) => row.id), ["investment:4", "fund:2", "income:1"]);
  assert.equal(activity[0].happenedAt, "2026-08-03");
});

test("archived asset identity remains visible in historical activity", () => {
  const buy = rows().find((row) => row.id === "investment:4");
  assert.equal(buy?.title, "طلای شخصی");
  assert.equal(buy?.sourceLabel, "اجرای برنامه");
});

test("fund activity keeps source provenance and action semantics", () => {
  const deposit = rows().find((row) => row.id === "fund:2");
  const withdraw = rows().find((row) => row.id === "fund:3");
  assert.equal(deposit?.detail, "واریز به صندوق");
  assert.equal(deposit?.sourceLabel, "کنارگذاری مستقیم");
  assert.equal(withdraw?.detail, "برداشت از صندوق");
  assert.equal(fundMovementSourceLabel("income_reversal"), "برگشت حذف ورودی");
});

test("activity search normalizes Persian variants and respects category filters", () => {
  const activity = rows();
  assert.deepEqual(filterFinancialActivity(activity, "investment", "طلا").map((row) => row.id), ["investment:4", "investment:5"]);
  assert.deepEqual(filterFinancialActivity(activity, "fund", "كنارگذاري").map((row) => row.id), ["fund:2"]);
  assert.equal(filterFinancialActivity(activity, "income", "اضطراری").length, 0);
});

test("activity summary reports factual recorded volume rather than inferred cash balance", () => {
  assert.deepEqual(summarizeFinancialActivity(rows()), {
    eventCount: 5,
    incomeTotal: 1000,
    fundTurnover: 350,
    investmentTurnover: 650,
  });
});

test("activity groups same-day records without claiming intraday financial ordering", () => {
  const groups = groupFinancialActivityByDay(rows());
  assert.deepEqual(groups.map((group) => [group.day, group.items.length]), [
    ["2026-08-03", 3],
    ["2026-08-02", 1],
    ["2026-08-01", 1],
  ]);
});

test("missing referenced entities stay explicit instead of disappearing from history", () => {
  const activity = buildFinancialActivity({ incomes: [], funds: [], fundMovements, assets: [], transactions });
  assert.equal(activity.find((row) => row.id === "fund:2")?.title, "صندوق نامشخص");
  assert.equal(activity.find((row) => row.id === "investment:4")?.title, "دارایی نامشخص");
});
