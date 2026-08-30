import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";
import { storesV6, storesV7, storesV8 } from "../lib/db-schema.ts";
import {
  CURRENT_SCHEMA8_NATIVE_VERSION,
  LEGACY_SCHEMA6_NATIVE_VERSION,
  SCHEMA6_STORES,
  legacySchema6SeedExpression,
  migratedSchema8InspectionExpression,
  providerCollisionInsertExpression,
} from "../scripts/fixtures/schema6-idb.mjs";

test("browser migration fixture mirrors the shipped schema 6 contract", () => {
  assert.deepEqual(SCHEMA6_STORES, storesV6);
  assert.equal(LEGACY_SCHEMA6_NATIVE_VERSION, 60);
  assert.equal(CURRENT_SCHEMA8_NATIVE_VERSION, 80);
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 8);
});

test("schema 8 keeps provider identity and adds the fund movement ledger", () => {
  assert.match(storesV7.marketWatchlist, /&\[source\+marketId\]/);
  assert.match(storesV7.marketAlerts, /\[source\+marketId\]/);
  assert.match(storesV8.fundMovements, /fundId/);
  assert.match(storesV8.fundMovements, /happenedAt/);
});

test("migration browser expressions seed legacy identity and inspect both migrations", () => {
  const seed = legacySchema6SeedExpression("2026-08-30T00:00:00.000Z");
  const inspect = migratedSchema8InspectionExpression();
  const collision = providerCollisionInsertExpression("2026-08-30T00:00:00.000Z");
  assert.match(seed, /indexedDB\.open\("poolyar-local", 60\)/);
  assert.match(seed, /Legacy migration fund/);
  assert.match(seed, /shared-market-id/);
  assert.match(inspect, /fundMovements/);
  assert.match(inspect, /watchIndexes/);
  assert.match(inspect, /alertIndexes/);
  assert.match(inspect, /watchMarketIdUnique/);
  assert.match(collision, /source: "tsetmc"/);
  assert.match(collision, /index\("marketId"\)\.getAll\("shared-market-id"\)/);
});
