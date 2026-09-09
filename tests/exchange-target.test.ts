import assert from "node:assert/strict";
import test from "node:test";
import { attachExchangeIdentity, normalizeExchangeSymbol, parseExchangeTargets } from "../lib/market/exchange-target.ts";

test("structured exchange targets are validated, normalized and de-duplicated", () => {
  const values = [
    JSON.stringify({ source: "tsetmc", id: "123", symbol: "كگل", name: "گل گهر" }),
    JSON.stringify({ source: "tsetmc", id: "123", symbol: "کگل", name: "تکراری" }),
    JSON.stringify({ source: "unknown", id: "x", symbol: "X", name: "X" }),
    "not-json",
  ];
  const targets = parseExchangeTargets(values);
  assert.equal(targets.length, 1);
  assert.equal(targets[0]?.symbol, "كگل");
  assert.equal(normalizeExchangeSymbol(targets[0]!.symbol), "کگل");
});

test("provider quotes carry actual source and original linked identity separately", () => {
  const target = { source: "tindex" as const, id: "slug", symbol: "عیار", name: "صندوق عیار" };
  const quote = attachExchangeIdentity({ symbol: "OTHER", name: "Other", priceToman: 10, changePercent: 0, changeValueToman: 0, asOf: "2026-09-09T00:00:00Z", source: "tsetmc" }, target);
  assert.equal(quote.source, "tsetmc");
  assert.equal(quote.marketSource, "tindex");
  assert.equal(quote.marketId, "slug");
  assert.equal(quote.symbol, "عیار");
});
