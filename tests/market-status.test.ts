import assert from "node:assert/strict";
import test from "node:test";
import {
  formatMarketDiagnostics,
  marketProviderActivityLabel,
  marketProviderStatusLabel,
  marketRuntimeStatus,
} from "../lib/market/status.ts";
import type { MarketHealthSummary } from "../lib/market/reliability.ts";

const health: MarketHealthSummary = {
  degraded: true,
  providers: {
    brsapi: { provider: "brsapi", status: "ok", configured: true, attempted: true, itemCount: 3, requestedCount: 3, latencyMs: 420 },
    tsetmc: { provider: "tsetmc", status: "degraded", configured: true, attempted: true, itemCount: 2, requestedCount: 4, latencyMs: 950, failure: "timeout" },
    tindex: { provider: "tindex", status: "unconfigured", configured: false, attempted: false },
  },
};

test("market runtime status distinguishes live degradation from offline fallback", () => {
  assert.equal(marketRuntimeStatus("live", health).label, "زنده، با محدودیت");
  assert.equal(marketRuntimeStatus("offline", health).label, "Snapshot محلی");
  assert.equal(marketRuntimeStatus("unavailable", undefined).label, "بازار تازه در دسترس نیست");
});

test("provider status explains partial counts without financial values", () => {
  const item = health.providers.tsetmc;
  assert.equal(marketProviderStatusLabel(item), "ناقص");
  const detail = marketProviderActivityLabel(item);
  assert.match(detail, /۲ از ۴ مورد/);
  assert.match(detail, /پاسخ دیر رسید/);
});

test("copied market diagnostics contain only operational metadata", () => {
  const text = formatMarketDiagnostics({ mode: "live", health, lastUpdated: "2026-08-27T09:00:00.000Z" });
  assert.match(text, /market_mode=live/);
  assert.match(text, /tsetmc=status:degraded/);
  assert.match(text, /failure:timeout/);
  assert.match(text, /privacy=financial-values-and-identifiers-excluded/);
  for (const forbidden of ["USD", "شستا", "عیار", "25000000", "BRS_API_KEY", "TINDEX_API_TOKEN"]) {
    assert.equal(text.includes(forbidden), false);
  }
});
