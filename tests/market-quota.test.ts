import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MARKET_CACHE_SECONDS,
  MARKET_CLIENT_REUSE_MS,
  activeProviderCooldown,
  parseRetryAfterSeconds,
  resetProviderCooldownsForTests,
} from "../lib/market/quota.ts";
import { MarketProviderError, runMarketProvider } from "../lib/market/reliability.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("launch cache policy keeps BrsApi comfortably below the documented free daily quota", () => {
  assert.equal(MARKET_CACHE_SECONDS.brsapiCoreQuotes, 180);
  assert.equal(Math.ceil(86_400 / MARKET_CACHE_SECONDS.brsapiCoreQuotes), 480);
  assert.equal(MARKET_CACHE_SECONDS.tsetmcQuote, 120);
  assert.equal(MARKET_CACHE_SECONDS.tsetmcSearch, 600);
  assert.equal(MARKET_CACHE_SECONDS.tsetmcHistory, 3600);
  assert.equal(MARKET_CACHE_SECONDS.tindexCoreFallback, 1800);
  assert.equal(MARKET_CACHE_SECONDS.tindexLegacyQuote, 3600);
  assert.equal(MARKET_CLIENT_REUSE_MS, 30_000);
});

test("Retry-After accepts seconds and HTTP dates while rejecting invalid input", () => {
  assert.equal(parseRetryAfterSeconds("42", 0), 42);
  assert.equal(parseRetryAfterSeconds("Thu, 01 Jan 1970 00:02:00 GMT", 60_000), 60);
  assert.equal(parseRetryAfterSeconds("nope", 0), undefined);
});

test("a provider rate limit arms a warm-runtime cooldown before another upstream attempt", async () => {
  resetProviderCooldownsForTests();
  let attempts = 0;
  const first = await runMarketProvider({
    provider: "tindex",
    operation: async () => {
      attempts += 1;
      throw new MarketProviderError("tindex", "rate_limited", 429, 120);
    },
  });
  assert.equal(first.health.failure, "rate_limited");
  assert.equal(first.health.guarded, true);
  assert.equal(attempts, 1);
  assert.ok(activeProviderCooldown("tindex"));

  const second = await runMarketProvider({
    provider: "tindex",
    operation: async () => {
      attempts += 1;
      return ["must-not-run"];
    },
  });
  assert.equal(second.value, undefined);
  assert.equal(second.health.attempted, false);
  assert.equal(second.health.guarded, true);
  assert.equal(attempts, 1);
  resetProviderCooldownsForTests();
});

test("provider implementations and client market hook consume the central quota policy", () => {
  const brs = read("lib/market/brsapi.ts");
  const tsetmc = read("lib/market/tsetmc.ts");
  const tindex = read("lib/market/tindex.ts");
  const hook = read("hooks/use-market.ts");
  assert.equal(brs.includes("MARKET_CACHE_SECONDS.brsapiCoreQuotes"), true);
  assert.equal(tsetmc.includes("MARKET_CACHE_SECONDS.tsetmcQuote"), true);
  assert.equal(tsetmc.includes("MARKET_CACHE_SECONDS.tsetmcSearch"), true);
  assert.equal(tindex.includes("MARKET_CACHE_SECONDS.tindexCoreFallback"), true);
  assert.equal(tindex.includes("slice(0, 1)"), true);
  const route = read("app/api/market/route.ts");
  assert.equal(hook.includes("recentResponse"), true);
  assert.equal(hook.includes("MARKET_CLIENT_REUSE_MS"), true);
  assert.equal(route.includes("s-maxage=60"), true);
  assert.equal(route.includes('"private, no-store"'), true);
});
