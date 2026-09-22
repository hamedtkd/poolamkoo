import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";
import { storesV6, storesV7, storesV8, storesV9 } from "../lib/db-schema.ts";
import {
  CURRENT_SCHEMA8_NATIVE_VERSION,
  CURRENT_SCHEMA9_NATIVE_VERSION,
  LEGACY_SCHEMA6_NATIVE_VERSION,
  SCHEMA6_STORES,
  legacySchema6SeedExpression,
  migratedSchema9InspectionExpression,
  providerCollisionInsertExpression,
} from "../scripts/fixtures/schema6-idb.mjs";

test("browser migration fixture mirrors the shipped schema 6 contract", () => {
  assert.deepEqual(SCHEMA6_STORES, storesV6);
  assert.equal(LEGACY_SCHEMA6_NATIVE_VERSION, 60);
  assert.equal(CURRENT_SCHEMA8_NATIVE_VERSION, 80);
  assert.equal(CURRENT_SCHEMA9_NATIVE_VERSION, 90);
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 9);
});

test("schema 9 preserves prior ledgers and adds loan persistence", () => {
  assert.match(storesV7.marketWatchlist, /&\[source\+marketId\]/);
  assert.match(storesV7.marketAlerts, /\[source\+marketId\]/);
  assert.match(storesV8.fundMovements, /fundId/);
  assert.match(storesV8.fundMovements, /happenedAt/);
  assert.match(storesV9.loans, /status/);
  assert.match(storesV9.loanPayments, /\[loanId\+installmentNo\]/);
  assert.match(storesV9.loanRiskAlerts, /loanId/);
});

test("migration browser expressions seed legacy identity and inspect schema 7 through 9", () => {
  const seed = legacySchema6SeedExpression("2026-08-30T00:00:00.000Z");
  const inspect = migratedSchema9InspectionExpression();
  const collision = providerCollisionInsertExpression("2026-08-30T00:00:00.000Z");
  assert.match(seed, /indexedDB\.open\("poolyar-local", 60\)/);
  assert.match(seed, /Legacy migration fund/);
  assert.match(seed, /shared-market-id/);
  assert.match(inspect, /fundMovements/);
  assert.match(inspect, /loanPayments/);
  assert.match(inspect, /loanRiskAlerts/);
  assert.match(inspect, /loanPaymentIndexes/);
  assert.match(inspect, /watchIndexes/);
  assert.match(inspect, /alertIndexes/);
  assert.match(inspect, /watchMarketIdUnique/);
  assert.match(collision, /source: "tsetmc"/);
  assert.match(collision, /index\("marketId"\)\.getAll\("shared-market-id"\)/);
});
