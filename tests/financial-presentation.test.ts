import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { formatMoney, formatSignedMoney, formatSignedPercent } from "../lib/format.ts";

const css = readFileSync("app/globals.css", "utf8");
const dashboard = readFileSync("components/sections/dashboard.tsx", "utf8");
const investments = readFileSync("components/sections/investments.tsx", "utf8");
const priceInput = readFileSync("components/ui/price-input.tsx", "utf8");
const reports = readFileSync("components/sections/reports.tsx", "utf8");
const portfolio = readFileSync("components/investments/portfolio-tables.tsx", "utf8");
const planActions = readFileSync("hooks/use-plan-item-actions.ts", "utf8");

test("money uses Persian digits with baseline ASCII grouping commas", () => {
  assert.equal(formatMoney(308_403_834), "۳۰۸,۴۰۳,۸۳۴ تومان");
  assert.equal(formatSignedMoney(308_403_834), "+۳۰۸,۴۰۳,۸۳۴ تومان");
  assert.equal(formatSignedMoney(-308_403_834), "−۳۰۸,۴۰۳,۸۳۴ تومان");
  assert.equal(formatSignedPercent(12.34, 2), "+۱۲.۳۴٪");
  assert.equal(formatSignedPercent(-12.34, 2), "−۱۲.۳۴٪");
  assert.match(priceInput, /formatGroupedNumber/);
  assert.match(reports, /formatSignedPercent/);
  assert.match(portfolio, /formatSignedPercent/);
  assert.match(planActions, /formatMoney/);
  assert.doesNotMatch(planActions, /Intl\.NumberFormat\("fa-IR"\).*تومان/);
});

test("profit and loss keep semantic green and red independent from theme palette", () => {
  assert.match(css, /--profit:\s*#15803d/);
  assert.match(css, /--loss:\s*#c62828/);
  assert.match(css, /--profit:\s*#4ade80/);
  assert.match(css, /--loss:\s*#f87171/);
  assert.match(dashboard, /text-profit/);
  assert.match(dashboard, /text-loss/);
  assert.match(investments, /سود باز/);
  assert.match(investments, /زیان باز/);
  assert.match(portfolio, /text-profit/);
  assert.match(portfolio, /text-loss/);
});
