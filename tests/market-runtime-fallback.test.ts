import assert from "node:assert/strict";
import test from "node:test";
import {
  freshMarketQuotes,
  marketQuoteForStorage,
  marketQuoteKey,
  mergeRuntimeMarketQuotes,
} from "../lib/market/runtime.ts";
import type { MarketQuote, MarketSnapshot } from "../lib/types.ts";

function quote(symbol: string, source: MarketQuote["source"], priceToman: number, marketId?: string): MarketQuote {
  return { symbol, name: symbol, source, priceToman, changePercent: 1, changeValueToman: 1, asOf: "2026-08-27T10:00:00.000Z", marketId };
}

function snapshot(symbol: string, source: MarketQuote["source"], priceToman: number, capturedAt: string, marketId?: string): MarketSnapshot {
  return { ...quote(symbol, source, priceToman, marketId), capturedAt };
}

test("partial refresh keeps fresh rows and fills only relevant missing quotes from latest real snapshots", () => {
  const fresh = [quote("USD", "brsapi", 100), quote("فولاد", "tsetmc", 200, "111")];
  const cached = [
    snapshot("USD", "brsapi", 90, "2026-08-27T08:00:00.000Z"),
    snapshot("IR_GOLD_18K", "brsapi", 300, "2026-08-27T09:00:00.000Z"),
    snapshot("BTC", "brsapi", 400, "2026-08-27T09:30:00.000Z"),
    snapshot("شستا", "tsetmc", 500, "2026-08-27T09:40:00.000Z", "222"),
    snapshot("غیرمرتبط", "tsetmc", 600, "2026-08-27T09:50:00.000Z", "999"),
  ];
  const merged = mergeRuntimeMarketQuotes({
    fresh,
    cached,
    targets: [{ source: "tsetmc", id: "111" }, { source: "tsetmc", id: "222" }],
  });

  assert.deepEqual(merged.quotes.map((row) => row.symbol), ["USD", "IR_GOLD_18K", "BTC", "فولاد", "شستا"]);
  assert.equal(merged.quotes.find((row) => row.symbol === "USD")?.priceToman, 100);
  assert.equal(merged.quotes.find((row) => row.symbol === "IR_GOLD_18K")?.runtimeSource, "snapshot");
  assert.equal(merged.quotes.find((row) => row.symbol === "شستا")?.snapshotCapturedAt, "2026-08-27T09:40:00.000Z");
  assert.equal(merged.quotes.some((row) => row.symbol === "غیرمرتبط"), false);
  assert.deepEqual(merged.coverage, {
    live: 2,
    snapshot: 3,
    total: 5,
    newestSnapshotAt: "2026-08-27T09:40:00.000Z",
    oldestSnapshotAt: "2026-08-27T09:00:00.000Z",
  });
});

test("newest snapshot wins and exchange identity remains provider scoped", () => {
  const cached = [
    snapshot("نماد", "tsetmc", 100, "2026-08-27T08:00:00.000Z", "42"),
    snapshot("نماد", "tsetmc", 120, "2026-08-27T09:00:00.000Z", "42"),
    snapshot("نماد", "tindex", 130, "2026-08-27T09:30:00.000Z", "42"),
  ];
  const merged = mergeRuntimeMarketQuotes({ fresh: [], cached, targets: [{ source: "tsetmc", id: "42" }] });
  assert.equal(merged.quotes.length, 1);
  assert.equal(merged.quotes[0]?.priceToman, 120);
  assert.equal(marketQuoteKey(merged.quotes[0]!), "tsetmc:42");
});

test("snapshot runtime metadata is never written back into persisted market snapshots", () => {
  const runtime = { ...quote("USD", "brsapi", 100), runtimeSource: "snapshot" as const, snapshotCapturedAt: "2026-08-27T09:00:00.000Z" };
  const stored = marketQuoteForStorage(runtime);
  assert.equal("runtimeSource" in stored, false);
  assert.equal("snapshotCapturedAt" in stored, false);
});

test("local market alerts can evaluate only fresh runtime quotes", () => {
  const rows = [
    { ...quote("USD", "brsapi", 100), runtimeSource: "live" as const },
    { ...quote("BTC", "brsapi", 200), runtimeSource: "snapshot" as const, snapshotCapturedAt: "2026-08-27T09:00:00.000Z" },
  ];
  assert.deepEqual(freshMarketQuotes(rows).map((row) => row.symbol), ["USD"]);
});
