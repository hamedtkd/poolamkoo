import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";
import { storesV6, storesV7 } from "../lib/db-schema.ts";
import {
  CURRENT_SCHEMA7_NATIVE_VERSION,
  LEGACY_SCHEMA6_NATIVE_VERSION,
  SCHEMA6_STORES,
  legacySchema6SeedExpression,
  migratedSchema7InspectionExpression,
  providerCollisionInsertExpression,
} from "../scripts/fixtures/schema6-idb.mjs";

test("browser migration fixture mirrors the shipped schema 6 contract", () => {
  assert.deepEqual(SCHEMA6_STORES, storesV6);
  assert.equal(LEGACY_SCHEMA6_NATIVE_VERSION, 60);
  assert.equal(CURRENT_SCHEMA7_NATIVE_VERSION, 70);
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 7);
});

test("schema 7 keeps provider-scoped indexes required by the migration smoke", () => {
  assert.match(storesV7.marketWatchlist, /&\[source\+marketId\]/);
  assert.match(storesV7.marketAlerts, /\[source\+marketId\]/);
});

test("migration browser expressions seed legacy identity and inspect the upgraded database", () => {
  const seed = legacySchema6SeedExpression("2026-08-30T00:00:00.000Z");
  const inspect = migratedSchema7InspectionExpression();
  const collision = providerCollisionInsertExpression("2026-08-30T00:00:00.000Z");
  assert.match(seed, /indexedDB\.open\("poolyar-local", 60\)/);
  assert.match(seed, /shared-market-id/);
  assert.match(inspect, /watchIndexes/);
  assert.match(inspect, /alertIndexes/);
  assert.match(inspect, /watchMarketIdUnique/);
  assert.match(collision, /source: "tsetmc"/);
  assert.match(collision, /index\("marketId"\)\.getAll\("shared-market-id"\)/);
});
