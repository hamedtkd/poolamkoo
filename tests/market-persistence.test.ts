import assert from "node:assert/strict";
import test from "node:test";
import { validatePortableData } from "../lib/data-portability.ts";
import { storesV7 } from "../lib/db-schema.ts";
import {
  marketIdentityKey,
  marketIdentityTuple,
  normalizePortableMarketIdentities,
} from "../lib/market/identity.ts";

function portable(overrides: Record<string, unknown> = {}) {
  return {
    allocationRules: [], incomes: [], allocations: [], funds: [], assets: [], transactions: [],
    settings: [{ id: "settings" }], marketWatchlist: [], marketAlerts: [], planItems: [],
    ...overrides,
  };
}

test("persistent market identity keeps providers distinct even when market ids collide", () => {
  assert.notEqual(
    marketIdentityKey({ source: "tsetmc", marketId: "123" }),
    marketIdentityKey({ source: "tindex", marketId: "123" }),
  );
  assert.deepEqual(marketIdentityTuple({ source: "tsetmc", marketId: "123" }), ["tsetmc", "123"]);
});

test("legacy persisted exchange rows default to Tindex while explicit TSETMC stays intact", () => {
  const normalized = normalizePortableMarketIdentities(portable({
    assets: [{ id: 1, marketId: "asset-old" }, { id: 2, marketId: "asset-new", marketSource: "tsetmc" }],
    marketWatchlist: [{ marketId: "watch-old" }, { marketId: "watch-new", source: "tsetmc" }],
    marketAlerts: [{ marketId: "alert-old" }, { marketId: "alert-new", source: "tsetmc" }],
  }));
  assert.equal((normalized.assets as Array<Record<string, unknown>>)[0].marketSource, "tindex");
  assert.equal((normalized.assets as Array<Record<string, unknown>>)[1].marketSource, "tsetmc");
  assert.equal((normalized.marketWatchlist as Array<Record<string, unknown>>)[0].source, "tindex");
  assert.equal((normalized.marketAlerts as Array<Record<string, unknown>>)[1].source, "tsetmc");
});

test("portable data permits the same market id from different providers", () => {
  const data = portable({ marketWatchlist: [
    { marketId: "123", source: "tsetmc" },
    { marketId: "123", source: "tindex" },
  ] });
  assert.equal(validatePortableData(data).watchlist, 2);
});

test("portable data rejects duplicate watchlist identity within one provider", () => {
  const data = portable({ marketWatchlist: [
    { marketId: "123", source: "tsetmc" },
    { marketId: "123", source: "tsetmc" },
  ] });
  assert.throws(() => validatePortableData(data), /شناسه تکراری/);
});

test("portable market rows require a real market id before destructive restore", () => {
  assert.throws(() => validatePortableData(portable({ marketWatchlist: [{}] })), /دیده‌بان بازار شناسه معتبر/);
  assert.throws(() => validatePortableData(portable({ marketAlerts: [{}] })), /هشدار بازار شناسه معتبر/);
});


test("schema 7 persists provider-scoped watchlist and alert indexes", () => {
  assert.match(storesV7.marketWatchlist, /&\[source\+marketId\]/);
  assert.match(storesV7.marketAlerts, /\[source\+marketId\]/);
});

test("portable data rejects unknown provider identity instead of silently reclassifying it", () => {
  assert.throws(
    () => validatePortableData(portable({ marketWatchlist: [{ marketId: "123", source: "unknown" }] })),
    /شناسه معتبر/,
  );
});
