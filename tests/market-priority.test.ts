import assert from "node:assert/strict";
import test from "node:test";
import { mergeMarketQuotes, needsCoreFallback } from "../lib/market/priority.ts";
import type { MarketQuote } from "../lib/types.ts";

function quote(symbol: string, priceToman: number, source: MarketQuote["source"]): MarketQuote {
  return { symbol, name: symbol, priceToman, changePercent: 0, changeValueToman: 0, asOf: "2026-08-24T10:00:00Z", source };
}

test("core merge preserves the primary quote when another source has the same symbol", () => {
  const merged = mergeMarketQuotes({
    fallback: [quote("USD", 100_000, "tindex"), quote("IR_GOLD_18K", 9_000_000, "tindex")],
    primary: [quote("USD", 101_000, "brsapi")],
  });
  assert.equal(merged.find((item) => item.symbol === "USD")?.priceToman, 101_000);
  assert.equal(merged.find((item) => item.symbol === "USD")?.source, "brsapi");
  assert.equal(merged.find((item) => item.symbol === "IR_GOLD_18K")?.source, "tindex");
});

test("core coverage detector reports only genuinely missing supported symbols", () => {
  assert.equal(needsCoreFallback([quote("USD", 1, "brsapi"), quote("IR_GOLD_18K", 1, "brsapi"), quote("BTC", 1, "brsapi")]), false);
  assert.equal(needsCoreFallback([quote("USD", 1, "brsapi")]), true);
});

test("exchange merge keys logical asset identity independently from the provider that returned the quote", () => {
  const direct = { ...quote("فولاد", 2_381, "tsetmc"), marketId: "46348559193224090", marketSource: "tsetmc" as const };
  const secondary = { ...quote("فولاد", 2_400, "brsapi"), marketId: "46348559193224090", marketSource: "tsetmc" as const };
  const separateLegacyIdentity = { ...quote("فولاد", 2_410, "tindex"), marketId: "46348559193224090", marketSource: "tindex" as const };
  const merged = mergeMarketQuotes({ exchange: [direct, secondary, separateLegacyIdentity] });
  assert.equal(merged.length, 2);
  assert.equal(merged.find((item) => item.marketSource === "tsetmc")?.source, "brsapi");
  assert.equal(merged.find((item) => item.marketSource === "tindex")?.source, "tindex");
});
