import assert from "node:assert/strict";
import test from "node:test";
import { buildReportDecisionSnapshot } from "../lib/report-insights.ts";
import { buildReportReconciliation } from "../lib/report-reconciliation.ts";
import { buildReportCsv, buildReportShareText, formatReportRange, reportExportFilename } from "../lib/report-export.ts";

const decision = buildReportDecisionSnapshot({
  totalIncome: 120_000_000,
  allocations: { life: 36_000_000, safety: 24_000_000, growth: 60_000_000 },
  rule: {
    id: 1, name: "متعادل", preset: "balanced", lifePct: 30, safetyPct: 20, growthPct: 50,
    isActive: true, createdAt: "2026-01-01", updatedAt: "2026-01-01",
  },
  planPlanned: 90_000_000,
  planExecuted: 81_000_000,
  funded: 40_000_000,
  fundTarget: 80_000_000,
});

const reconciliation = buildReportReconciliation({
  incomes: [{ id: 1, amountToman: 120_000_000, title: "حقوق", happenedAt: "2026-08-10", createdAt: "2026-08-10" }],
  allocations: [
    { incomeId: 1, bucket: "life", amountToman: 36_000_000, createdAt: "2026-08-10" },
    { incomeId: 1, bucket: "safety", amountToman: 24_000_000, createdAt: "2026-08-10" },
    { incomeId: 1, bucket: "growth", amountToman: 60_000_000, createdAt: "2026-08-10" },
  ],
  planItems: [{ incomeId: 1, bucket: "growth", targetType: "bucket", label: "رشد", plannedToman: 90_000_000, executedToman: 81_000_000, createdAt: "2026-08-10", updatedAt: "2026-08-10" }],
  fundMovements: [
    { fundId: 1, type: "deposit", source: "manual", amountToman: 10_000_000, happenedAt: "2026-08-11", createdAt: "2026-08-11", updatedAt: "2026-08-11" },
    { fundId: 1, type: "withdraw", source: "manual", amountToman: 2_000_000, happenedAt: "2026-08-12", createdAt: "2026-08-12", updatedAt: "2026-08-12" },
  ],
  transactions: [
    { assetId: 1, type: "buy", amountToman: 20_000_000, quantity: 1, unitPriceToman: 20_000_000, happenedAt: "2026-08-13", createdAt: "2026-08-13" },
    { assetId: 1, type: "sell", amountToman: 5_000_000, quantity: 0.2, unitPriceToman: 25_000_000, happenedAt: "2026-08-14", createdAt: "2026-08-14" },
  ],
});

const input = {
  range: { from: new Date(2026, 7, 1), to: new Date(2026, 7, 27) },
  unit: "toman" as const,
  decision,
  reconciliation,
  performance: [{ name: 'صندوق "الف,ب"', target: 40, actual: 44.5, value: 50_000_000, pnl: 4_000_000, pnlPct: 8.7, priceSource: "live-market" as const, pricingReliable: true }],
};

test("share summary deliberately excludes financial amounts and asset names", () => {
  const text = buildReportShareText(input);
  assert.match(text, /خلاصه تصمیمی پولم‌کو/);
  assert.match(text, /اجرای برنامه: ۹۰٪/);
  assert.match(text, /پوشش صندوق‌ها: ۵۰٪/);
  assert.doesNotMatch(text, /120000000|۱۲۰.?۰۰۰.?۰۰۰/);
  assert.doesNotMatch(text, /صندوق "الف,ب"/);
  assert.match(text, /عمداً مبلغ‌ها و نام دارایی‌ها/);
});

test("CSV export keeps explicit financial detail and escapes spreadsheet cells", () => {
  const csv = buildReportCsv(input);
  assert.match(csv, /کل پول ورودی,,120000000,تومان/);
  assert.match(csv, /سبد سرمایه‌گذاری/);
  assert.match(csv, /"صندوق ""الف,ب"""/);
  assert.match(csv, /50000000,تومان,40,44\.5,4\.5/);
  assert.match(csv, /تطبیق جریان,پوشش تخصیص,,100,درصد/);
  assert.match(csv, /گردش صندوق,واریز در بازه,,10000000,تومان/);
  assert.match(csv, /گردش صندوق,خالص گردش دوره,,8000000,تومان/);
  assert.match(csv, /گردش سرمایه‌گذاری,خرید در بازه,,20000000,تومان/);
  assert.match(csv, /گردش سرمایه‌گذاری,خالص جریان خرید,,15000000,تومان/);
});


test("CSV neutralizes spreadsheet-formula prefixes in user supplied names", () => {
  const csv = buildReportCsv({ ...input, performance: [{ ...input.performance[0], name: '=HYPERLINK("https://example.test")' }] });
  assert.match(csv, /'\=HYPERLINK/);
  assert.doesNotMatch(csv, /,=HYPERLINK/);
});

test("report range labels and filenames stay deterministic", () => {
  assert.notEqual(formatReportRange(input.range), "همه زمان");
  assert.equal(formatReportRange({ from: null, to: null }), "همه زمان");
  assert.equal(reportExportFilename("csv", new Date(2026, 7, 27)), "poolamkoo-report-2026-08-27.csv");
});


test("detailed CSV exposes valuation provenance while share summary stays privacy-minimized", () => {
  const report = { ...input, performance: [{ ...input.performance[0], priceSource: "snapshot-market" as const, pricingReliable: false }] };
  assert.match(buildReportCsv(report), /منبع ارزش‌گذاری/);
  assert.match(buildReportCsv(report), /Snapshot محلی/);
  assert.doesNotMatch(buildReportShareText(report), /Snapshot محلی|صندوق "الف,ب"/);
});
