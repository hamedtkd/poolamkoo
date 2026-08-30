import assert from "node:assert/strict";
import test from "node:test";
import {
  formatMarketDiagnostics,
  marketCoverageLabel,
  marketProviderActivityLabel,
  marketProviderStatusLabel,
  marketRuntimeStatus,
  marketSnapshotCoverageDetail,
} from "../lib/market/status.ts";
import type { MarketHealthSummary } from "../lib/market/reliability.ts";
import type { MarketCoverage } from "../lib/market/runtime.ts";

const health: MarketHealthSummary = {
  degraded: true,
  providers: {
    brsapi: { provider: "brsapi", status: "ok", configured: true, attempted: true, itemCount: 3, requestedCount: 3, latencyMs: 420 },
    tsetmc: { provider: "tsetmc", status: "degraded", configured: true, attempted: true, itemCount: 2, requestedCount: 4, latencyMs: 950, failure: "timeout" },
    tindex: { provider: "tindex", status: "unconfigured", configured: false, attempted: false },
  },
};

const coverage: MarketCoverage = {
  live: 5,
  snapshot: 2,
  total: 7,
  newestSnapshotAt: "2026-08-27T09:30:00.000Z",
  oldestSnapshotAt: "2026-08-27T08:00:00.000Z",
};

test("market runtime status distinguishes mixed live/snapshot coverage from full offline fallback", () => {
  assert.equal(marketRuntimeStatus("live", health, coverage).label, "زنده + Snapshot");
  assert.equal(marketRuntimeStatus("live", health, { live: 2, snapshot: 0, total: 2 }).label, "زنده، با محدودیت");
  assert.equal(marketRuntimeStatus("offline", health, coverage).label, "Snapshot محلی");
  assert.equal(marketRuntimeStatus("unavailable", undefined).label, "بازار تازه در دسترس نیست");
});

test("provider status explains partial counts without financial values", () => {
  const item = health.providers.tsetmc;
  assert.equal(marketProviderStatusLabel(item), "ناقص");
  const detail = marketProviderActivityLabel(item);
  assert.match(detail, /۲ از ۴ مورد/);
  assert.match(detail, /پاسخ دیر رسید/);
});

test("coverage labels expose fresh versus local snapshot counts without quote identifiers", () => {
  assert.equal(marketCoverageLabel(coverage), "۵ تازه · ۲ Snapshot محلی");
  assert.match(marketSnapshotCoverageDetail(coverage) ?? "", /قدیمی‌ترین Snapshot فعال/);
});

test("copied market diagnostics contain only operational metadata", () => {
  const text = formatMarketDiagnostics({ mode: "live", health, coverage, lastUpdated: "2026-08-27T09:00:00.000Z" });
  assert.match(text, /market_mode=live/);
  assert.match(text, /tsetmc=status:degraded/);
  assert.match(text, /failure:timeout/);
  assert.match(text, /coverage_live=5/);
  assert.match(text, /coverage_snapshot=2/);
  assert.match(text, /oldest_snapshot_at=2026-08-27T08:00:00.000Z/);
  assert.match(text, /privacy=financial-values-and-identifiers-excluded/);
  for (const forbidden of ["USD", "شستا", "عیار", "25000000", "BRS_API_KEY", "TINDEX_API_TOKEN"]) {
    assert.equal(text.includes(forbidden), false);
  }
});
