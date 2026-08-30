import test from "node:test";
import assert from "node:assert/strict";
import { PWA_UPDATE_MESSAGE, pwaUpdateReady } from "../lib/pwa-update.ts";

test("first service worker install does not look like an app update", () => {
  assert.equal(pwaUpdateReady({ hasController: false, hasWaitingWorker: true }), false);
});

test("a waiting worker is update-ready only when an old worker controls the page", () => {
  assert.equal(pwaUpdateReady({ hasController: true, hasWaitingWorker: true }), true);
  assert.equal(pwaUpdateReady({ hasController: true, hasWaitingWorker: false }), false);
  assert.equal(PWA_UPDATE_MESSAGE, "SKIP_WAITING");
});

test("dismissing the current waiting worker keeps that same update quiet", () => {
  assert.equal(pwaUpdateReady({ hasController: true, hasWaitingWorker: true, waitingWorkerDismissed: true }), false);
  assert.equal(pwaUpdateReady({ hasController: true, hasWaitingWorker: true, waitingWorkerDismissed: false }), true);
});
