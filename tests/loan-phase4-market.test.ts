import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("phase 4.3 wires exact market freshness into loan risk runtime", () => {
  const analytics = readFileSync(new URL("../lib/loans/analytics.ts", import.meta.url), "utf8");
  const freshness = readFileSync(new URL("../lib/market/freshness.ts", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../hooks/use-loan-risk.ts", import.meta.url), "utf8");
  assert.match(analytics, /assetMarketFreshness/);
  assert.match(freshness, /quote\.asOf/);
  assert.match(freshness, /automaticRiskReady/);
  assert.match(hook, /marketReady/);
});

test("phase 4.3 manages stale quote and fund spread policies", () => {
  const policy = readFileSync(new URL("../lib/loans/risk-policy.ts", import.meta.url), "utf8");
  const risk = readFileSync(new URL("../lib/loans/risk.ts", import.meta.url), "utf8");
  assert.match(policy, /kind: "quote_stale"/);
  assert.match(policy, /kind: "spread_below"/);
  assert.match(risk, /MIN_SPREAD_OBSERVATION_DAYS = 90/);
});

test("phase 4.3 keeps stress scenarios separate from forecasts", () => {
  const scenarios = readFileSync(new URL("../components/loans/loan-scenarios.tsx", import.meta.url), "utf8");
  assert.match(scenarios, /shockPct/);
  assert.match(scenarios, /linkedAssetValueToman/);
  assert.match(scenarios, /stressedNetEffectToman/);
});
