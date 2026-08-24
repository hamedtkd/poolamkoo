import assert from "node:assert/strict";
import test from "node:test";
import { mergeMarketQuotes, needsCoreFallback } from "../lib/market/priority.ts";
import type { MarketQuote } from "../lib/types.ts";

function quote(symbol: string, priceToman: number, source: MarketQuote["source"]): MarketQuote {
  return { symbol, name: symbol, priceToman, changePercent: 0, changeValueToman: 0, asOf: "2026-08-24T10:00:00Z", source };
}

test("BrsApi remains primary when Tindex fallback has the same core symbol", () => {
  const merged = mergeMarketQuotes({
    fallback: [quote("USD", 100_000, "tindex"), quote("IR_GOLD_18K", 9_000_000, "tindex")],
    primary: [quote("USD", 101_000, "brsapi")],
  });
  assert.equal(merged.find((item) => item.symbol === "USD")?.priceToman, 101_000);
  assert.equal(merged.find((item) => item.symbol === "USD")?.source, "brsapi");
  assert.equal(merged.find((item) => item.symbol === "IR_GOLD_18K")?.source, "tindex");
});

test("Tindex core fallback is requested only when BrsApi misses a supported core quote", () => {
  assert.equal(needsCoreFallback([quote("USD", 1, "brsapi"), quote("IR_GOLD_18K", 1, "brsapi"), quote("BTC", 1, "brsapi")]), false);
  assert.equal(needsCoreFallback([quote("USD", 1, "brsapi")]), true);
});
