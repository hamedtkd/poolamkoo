import assert from "node:assert/strict";
import test from "node:test";
import { mergeRemoteAlerts, remoteAlertStates, toRemoteAlerts } from "../lib/push/remote-alerts.ts";
import { parseSubscription, sameOrigin } from "../lib/push/server-validation.ts";
import type { MarketAlert } from "../lib/types.ts";

function alert(overrides: Partial<MarketAlert> = {}): MarketAlert {
  return {
    id: 7,
    marketId: "ayar",
    symbol: "عیار",
    name: "صندوق طلای عیار",
    source: "tindex",
    kind: "nav_discount",
    threshold: 2,
    enabled: true,
    notifyBrowser: true,
    armed: true,
    createdAt: "2026-08-25T08:00:00.000Z",
    updatedAt: "2026-08-25T08:00:00.000Z",
    ...overrides,
  };
}

test("remote push mirrors only opted-in browser alerts", () => {
  const rows = toRemoteAlerts([
    alert(),
    alert({ id: 8, notifyBrowser: false }),
    alert({ id: 9, threshold: 0 }),
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.id, 7);
  assert.equal(rows[0]?.marketId, "ayar");
  assert.equal("name" in (rows[0] ?? {}), false);
});

test("newer remote trigger state is not overwritten by stale local sync", () => {
  const incoming = toRemoteAlerts([alert({ armed: true, updatedAt: "2026-08-25T09:00:00.000Z" })]);
  const previous = [{ ...incoming[0]!, armed: false, lastTriggeredAt: "2026-08-25T10:00:00.000Z", updatedAt: "2026-08-25T10:00:00.000Z" }];
  const merged = mergeRemoteAlerts(incoming, previous);
  assert.equal(merged[0]?.armed, false);
  assert.equal(merged[0]?.lastTriggeredAt, "2026-08-25T10:00:00.000Z");
});

test("newer local change can intentionally rearm remote state", () => {
  const incoming = toRemoteAlerts([alert({ armed: true, updatedAt: "2026-08-25T11:00:00.000Z" })]);
  const previous = [{ ...incoming[0]!, armed: false, lastTriggeredAt: "2026-08-25T10:00:00.000Z", updatedAt: "2026-08-25T10:00:00.000Z" }];
  const merged = mergeRemoteAlerts(incoming, previous);
  assert.equal(merged[0]?.armed, true);
  assert.equal(remoteAlertStates(merged)[0]?.updatedAt, "2026-08-25T11:00:00.000Z");
});


test("push subscription validation accepts only HTTPS capability endpoints", () => {
  assert.ok(parseSubscription({ endpoint: "https://push.example/sub", keys: { p256dh: "key", auth: "auth" } }));
  assert.equal(parseSubscription({ endpoint: "http://push.example/sub", keys: { p256dh: "key", auth: "auth" } }), null);
});

test("push sync rejects cross-origin requests", () => {
  const good = new Request("https://poolamkoo.example/api/push/subscription", { headers: { Origin: "https://poolamkoo.example" } });
  const bad = new Request("https://poolamkoo.example/api/push/subscription", { headers: { Origin: "https://evil.example" } });
  assert.equal(sameOrigin(good), true);
  assert.equal(sameOrigin(bad), false);
});
