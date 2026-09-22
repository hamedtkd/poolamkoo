import assert from "node:assert/strict";
import test from "node:test";
import { assetMarketFreshness, marketFreshnessLimitHours, marketQuoteAgeHours } from "../lib/market/freshness.ts";
import type { Asset, MarketQuote } from "../lib/types.ts";

const now = new Date("2026-09-21T12:00:00.000Z");
const gold: Asset = { id: 1, name: "gold", kind: "gold", symbol: "IR_GOLD_18K", targetPct: 0, icon: "gold", archived: false, createdAt: now.toISOString(), updatedAt: now.toISOString() };
function quote(asOf: string, runtimeSource: "live" | "snapshot" = "live"): MarketQuote {
  return { symbol: "IR_GOLD_18K", name: "gold", priceToman: 1, changePercent: 0, changeValueToman: 0, asOf, source: "tindex", runtimeSource };
}

test("market quote freshness uses exact asOf age, not runtime source alone", () => {
  assert.equal(marketQuoteAgeHours(quote("2026-09-21T10:00:00.000Z"), now), 2);
  assert.equal(assetMarketFreshness(gold, quote("2026-09-21T10:00:00.000Z"), now).state, "fresh");
  assert.equal(assetMarketFreshness(gold, quote("2026-09-21T00:00:00.000Z"), now).state, "stale");
});

test("snapshot quotes never become automatic risk inputs even when recently captured", () => {
  const state = assetMarketFreshness(gold, quote("2026-09-21T11:59:00.000Z", "snapshot"), now);
  assert.equal(state.state, "stale");
  assert.equal(state.automaticRiskReady, false);
});

test("freshness policy is tighter for continuously moving assets than exchange assets", () => {
  assert.equal(marketFreshnessLimitHours({ kind: "crypto" }), 2);
  assert.equal(marketFreshnessLimitHours({ kind: "gold" }), 8);
  assert.equal(marketFreshnessLimitHours({ kind: "stock" }), 36);
});
