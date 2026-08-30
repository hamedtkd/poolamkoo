import assert from "node:assert/strict";
import test from "node:test";
import { marketQuoteForAsset, marketQuoteForTarget, resolveAssetValuation } from "../lib/market/valuation.ts";
import { buildGrowthPlan, growthPlanPricingReady } from "../lib/planning.ts";
import type { Asset, InvestmentTransaction, MarketQuote } from "../lib/types.ts";

function asset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 1,
    name: "دارایی",
    kind: "stock",
    symbol: "TEST",
    marketId: "123",
    marketSource: "tsetmc",
    targetPct: 100,
    icon: "asset",
    archived: false,
    createdAt: "2026-08-30T00:00:00.000Z",
    updatedAt: "2026-08-30T00:00:00.000Z",
    ...overrides,
  };
}

function quote(overrides: Partial<MarketQuote> = {}): MarketQuote {
  return {
    marketId: "123",
    symbol: "TEST",
    name: "دارایی",
    priceToman: 1_000,
    changePercent: 1,
    changeValueToman: 10,
    asOf: "2026-08-30T05:00:00.000Z",
    source: "tsetmc",
    runtimeSource: "live",
    ...overrides,
  };
}

test("linked exchange assets keep provider-scoped quote identity downstream", () => {
  const rows = [
    quote({ source: "tindex", marketId: "123", priceToman: 2_000 }),
    quote({ source: "tsetmc", marketId: "123", priceToman: 1_000 }),
  ];
  assert.equal(marketQuoteForAsset(asset(), rows)?.priceToman, 1_000);
});

test("linked assets never cross-fill from another provider with the same id or symbol", () => {
  const resolved = resolveAssetValuation(
    asset({ manualPriceToman: 900 }),
    [quote({ source: "tindex", marketId: "123", priceToman: 2_000 })],
  );
  assert.equal(resolved.source, "manual");
  assert.equal(resolved.price, 900);
});

test("live market and explicit manual prices are decision-ready", () => {
  assert.equal(resolveAssetValuation(asset(), [quote()]).decisionReady, true);
  assert.equal(resolveAssetValuation(asset({ marketId: undefined, marketSource: undefined, manualPriceToman: 850 }), []).decisionReady, true);
});

test("snapshot and cost-basis fallback stay display-only for allocation decisions", () => {
  const snapshot = resolveAssetValuation(asset(), [quote({ runtimeSource: "snapshot", snapshotCapturedAt: "2026-08-29T05:00:00.000Z" })]);
  const missing = resolveAssetValuation(asset({ manualPriceToman: undefined }), []);
  assert.equal(snapshot.source, "snapshot-market");
  assert.equal(snapshot.decisionReady, false);
  assert.equal(missing.source, "cost-basis");
  assert.equal(missing.decisionReady, false);
});


test("watchlist and alert targets keep provider-scoped identity", () => {
  const rows = [
    quote({ source: "tindex", marketId: "123", priceToman: 2_000 }),
    quote({ source: "tsetmc", marketId: "123", priceToman: 1_000 }),
  ];
  assert.equal(marketQuoteForTarget({ source: "tsetmc", marketId: "123", symbol: "TEST" }, rows)?.priceToman, 1_000);
});

test("snapshot-held assets pause automatic growth distribution until decision-ready pricing returns", () => {
  const held = asset({ targetPct: 100 });
  const transactions: InvestmentTransaction[] = [{
    id: 1, assetId: 1, type: "buy", amountToman: 1_000, quantity: 1, unitPriceToman: 1_000,
    happenedAt: "2026-08-29T00:00:00.000Z", createdAt: "2026-08-29T00:00:00.000Z",
  }];
  const snapshot = [quote({ runtimeSource: "snapshot", snapshotCapturedAt: "2026-08-29T05:00:00.000Z" })];
  assert.equal(growthPlanPricingReady([held], transactions, snapshot), false);
  assert.deepEqual(buildGrowthPlan(500, [held], transactions, snapshot), []);
  assert.equal(growthPlanPricingReady([held], transactions, [quote()]), true);
  assert.equal(buildGrowthPlan(500, [held], transactions, [quote()]).reduce((sum, row) => sum + row.amountToman, 0), 500);
});
