import assert from "node:assert/strict";
import test from "node:test";
import { buildInvestmentAnalytics, withInvestmentShares } from "../lib/investment-analytics.ts";
import type { Asset, InvestmentTransaction, MarketQuote } from "../lib/types.ts";

const now = "2026-09-17T00:00:00.000Z";
const assets: Asset[] = [
  { id: 1, name: "طلا", kind: "gold", symbol: "IR_GOLD_18K", targetPct: 50, icon: "gold", archived: false, createdAt: now, updatedAt: now },
  { id: 2, name: "دلار", kind: "currency", symbol: "USD", targetPct: 50, icon: "dollar", archived: false, createdAt: now, updatedAt: now },
];
const transactions: InvestmentTransaction[] = [
  { id: 1, assetId: 1, type: "buy", amountToman: 10_000_000, quantity: 10, unitPriceToman: 1_000_000, happenedAt: now, createdAt: now },
  { id: 2, assetId: 2, type: "buy", amountToman: 12_000_000, quantity: 12, unitPriceToman: 1_000_000, happenedAt: now, createdAt: now },
];
const quotes: MarketQuote[] = [
  { symbol: "IR_GOLD_18K", name: "طلا", priceToman: 1_400_000, changePercent: 0, changeValueToman: 0, asOf: now, source: "brsapi", runtimeSource: "live" },
  { symbol: "USD", name: "دلار", priceToman: 900_000, changePercent: 0, changeValueToman: 0, asOf: now, source: "brsapi", runtimeSource: "live" },
];

test("investment analytics separates invested cost, current composition and P/L", () => {
  const snapshot = withInvestmentShares(buildInvestmentAnalytics(assets, transactions, quotes));
  assert.equal(snapshot.openCostToman, 22_000_000);
  assert.equal(snapshot.pricedCurrentValueToman, 24_800_000);
  assert.equal(snapshot.unrealizedPnlToman, 2_800_000);
  assert.equal(Number(snapshot.assets[0]!.costSharePct.toFixed(1)), 45.5);
  assert.equal(Number(snapshot.assets[0]!.valueSharePct!.toFixed(1)), 56.5);
});

test("missing current price never fabricates market profit", () => {
  const snapshot = buildInvestmentAnalytics(assets, transactions, quotes.filter((quote) => quote.symbol !== "USD"));
  const dollar = snapshot.assets.find((row) => row.asset.id === 2)!;
  assert.equal(dollar.currentValueToman, undefined);
  assert.equal(dollar.unrealizedPnlToman, undefined);
  assert.equal(snapshot.pricingComplete, false);
  assert.equal(Number(snapshot.priceCoveragePct.toFixed(1)), 45.5);
});
