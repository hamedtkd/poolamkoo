import assert from "node:assert/strict";
import test from "node:test";
import { marketAlertConditionMet, marketAlertTransition, suggestedMarketAlertThreshold } from "../lib/market/alerts.ts";
import type { MarketAlert, MarketQuote } from "../lib/types.ts";

const quote: MarketQuote = {
  symbol: "عیار",
  name: "صندوق طلای عیار",
  priceToman: 100_000,
  navToman: 102_000,
  changePercent: -3.2,
  changeValueToman: -3_200,
  asOf: "2026-08-25T09:00:00.000Z",
  source: "tindex",
};

function alert(kind: MarketAlert["kind"], threshold: number, armed = true): MarketAlert {
  return { marketId: "1", symbol: "عیار", name: "صندوق طلای عیار", source: "tindex", kind, threshold, enabled: true, notifyBrowser: false, armed, createdAt: "x", updatedAt: "x" };
}

test("price and daily-change alerts use explicit thresholds", () => {
  assert.equal(marketAlertConditionMet(alert("price_below", 101_000), quote), true);
  assert.equal(marketAlertConditionMet(alert("price_above", 101_000), quote), false);
  assert.equal(marketAlertConditionMet(alert("change_below", 3), quote), true);
  assert.equal(marketAlertConditionMet(alert("change_above", 3), quote), false);
});

test("NAV alerts compare market price with published NAV", () => {
  assert.equal(marketAlertConditionMet(alert("nav_discount", 1.5), quote), true);
  assert.equal(marketAlertConditionMet(alert("nav_premium", 1.5), quote), false);
});

test("alerts trigger once and only rearm after the condition clears", () => {
  assert.equal(marketAlertTransition(alert("price_below", 101_000, true), quote), "trigger");
  assert.equal(marketAlertTransition(alert("price_below", 101_000, false), quote), "none");
  assert.equal(marketAlertTransition(alert("price_below", 99_000, false), quote), "rearm");
});

test("suggested thresholds stay close to the current market price", () => {
  const target = { marketId: "1", symbol: "عیار", name: "عیار", source: "tindex" as const, priceToman: 100_000 };
  assert.equal(suggestedMarketAlertThreshold("price_below", target), 98_000);
  assert.equal(suggestedMarketAlertThreshold("price_above", target), 102_000);
  assert.equal(suggestedMarketAlertThreshold("nav_discount", target), 2);
});
