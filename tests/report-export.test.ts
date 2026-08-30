import assert from "node:assert/strict";
import test from "node:test";
import { buildReportDecisionSnapshot } from "../lib/report-insights.ts";
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

const input = {
  range: { from: new Date(2026, 7, 1), to: new Date(2026, 7, 27) },
  unit: "toman" as const,
  decision,
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
