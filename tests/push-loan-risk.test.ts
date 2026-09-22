import assert from "node:assert/strict";
import test from "node:test";
import { mergeRemoteLoanRiskAlerts, remoteLoanRiskTransition, toRemoteLoanRiskAlerts } from "../lib/push/loan-risk.ts";
import type { Asset, LoanRiskAlert } from "../lib/types.ts";

const asset: Asset = { id: 8, name: "fund", kind: "fund", marketId: "slug", marketSource: "tindex", symbol: "FUND", targetPct: 0, icon: "fund", archived: false, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
const alert: LoanRiskAlert = { id: 9, loanId: 4, assetId: 8, kind: "quote_stale", threshold: 36, rearmThreshold: 18, enabled: true, armed: true, notifyBrowser: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-21T00:00:00.000Z" };

test("remote loan risk mirror includes only privacy-minimized Tindex quote freshness alerts", () => {
  const rows = toRemoteLoanRiskAlerts([alert], [asset]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.marketId, "slug");
  assert.equal("name" in (rows[0] as object), false);
  assert.equal("amount" in (rows[0] as object), false);
});

test("remote quote freshness risk triggers and rearms with hysteresis", () => {
  const remote = toRemoteLoanRiskAlerts([alert], [asset])[0]!;
  const now = new Date("2026-09-21T12:00:00.000Z");
  assert.equal(remoteLoanRiskTransition(remote, { asOf: "2026-09-19T00:00:00.000Z" }, now), "trigger");
  assert.equal(remoteLoanRiskTransition({ ...remote, armed: false }, { asOf: "2026-09-21T06:00:00.000Z" }, now), "rearm");
});

test("remote risk merge preserves newer server trigger state", () => {
  const incoming = toRemoteLoanRiskAlerts([alert], [asset])[0]!;
  const previous = { ...incoming, armed: false, lastTriggeredAt: "2026-09-21T10:00:00.000Z", updatedAt: "2026-09-21T10:00:00.000Z" };
  const olderClient = { ...incoming, updatedAt: "2026-09-21T09:00:00.000Z" };
  const merged = mergeRemoteLoanRiskAlerts([olderClient], [previous]);
  assert.equal(merged[0]?.armed, false);
  assert.equal(merged[0]?.lastTriggeredAt, previous.lastTriggeredAt);
});
