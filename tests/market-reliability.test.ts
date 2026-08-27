import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyMarketProviderError,
  marketProviderWarning,
  mergeProviderHealth,
  providerErrorFromStatus,
  providerIdle,
  runMarketProvider,
  summarizeMarketHealth,
} from "../lib/market/reliability.ts";

test("provider HTTP failures map to stable public failure kinds", () => {
  assert.equal(providerErrorFromStatus("tsetmc", 403).failure, "blocked");
  assert.equal(providerErrorFromStatus("tindex", 403).failure, "unauthorized");
  assert.equal(providerErrorFromStatus("brsapi", 429).failure, "rate_limited");
  assert.equal(providerErrorFromStatus("brsapi", 503).failure, "upstream");
});

test("runtime failures classify timeout and network without exposing raw upstream text", () => {
  const timeout = classifyMarketProviderError("tsetmc", { name: "TimeoutError", message: "secret upstream detail" });
  const network = classifyMarketProviderError("brsapi", new TypeError("internal DNS detail"));
  assert.equal(timeout.failure, "timeout");
  assert.equal(network.failure, "network");
  assert.doesNotMatch(marketProviderWarning({ provider: "tsetmc", status: "unavailable", configured: true, attempted: true, failure: timeout.failure }) ?? "", /secret upstream detail/);
});

test("provider health becomes degraded when only part of the requested data arrives", async () => {
  const run = await runMarketProvider({
    provider: "tsetmc",
    requestedCount: 3,
    operation: async () => ["a", "b"],
    itemCount: (rows) => rows.length,
  });
  assert.deepEqual(run.value, ["a", "b"]);
  assert.equal(run.health.status, "degraded");
  assert.equal(run.health.itemCount, 2);
  assert.equal(run.health.requestedCount, 3);
});

test("provider health exposes only classified failure metadata on errors", async () => {
  const run = await runMarketProvider({
    provider: "tindex",
    operation: async () => { throw new Error("quota account abc@example.com raw provider body"); },
  });
  assert.equal(run.value, undefined);
  assert.equal(run.health.status, "unavailable");
  assert.equal(run.health.failure, "upstream");
  assert.equal(JSON.stringify(run.health).includes("abc@example.com"), false);
});

test("combined provider health preserves partial failures and marks the market degraded", () => {
  const legacy = { provider: "tindex" as const, status: "unavailable" as const, configured: true, attempted: true, failure: "timeout" as const };
  const fallback = { provider: "tindex" as const, status: "ok" as const, configured: true, attempted: true, itemCount: 2, requestedCount: 2 };
  const merged = mergeProviderHealth(legacy, fallback);
  assert.equal(merged.status, "degraded");
  assert.equal(merged.failure, "timeout");
  const summary = summarizeMarketHealth([providerIdle("brsapi", false), merged]);
  assert.equal(summary.degraded, true);
  assert.equal(summary.providers.tindex?.status, "degraded");
});
