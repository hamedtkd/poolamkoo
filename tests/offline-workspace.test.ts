import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("offline workspace verifies the active worker cache and repairs missing routes", () => {
  const manager = read("components/system/offline-workspace-manager.tsx");
  const routeLayout = read("components/app/app-route-layout.tsx");
  assert.equal(manager.includes('"/dashboard"'), true);
  assert.equal(manager.includes('"/income"'), true);
  assert.equal(manager.includes('"/funds"'), true);
  assert.equal(manager.includes('"/investments"'), true);
  assert.equal(manager.includes('"/reports"'), true);
  assert.equal(manager.includes('"GET_OFFLINE_STATUS"'), true);
  assert.equal(manager.includes('"x-poolamkoo-warm": "1"'), true);
  assert.equal(manager.includes('navigator.serviceWorker.addEventListener("controllerchange"'), true);
  assert.equal(manager.includes("sessionStorage"), false);
  assert.equal(routeLayout.includes("<OfflineWorkspaceManager />"), true);
});

test("offline navigation uses cached documents instead of uncached Next route-data requests", () => {
  const manager = read("components/system/offline-workspace-manager.tsx");
  const helper = read("lib/workspace-navigation.ts");
  const screen = read("components/system/offline-screen.tsx");
  assert.equal(manager.includes("window.location.href = url.href"), true);
  assert.equal(manager.includes('dataset.poolamkooNetwork = "offline"'), true);
  assert.equal(helper.includes('dataset.poolamkooNetwork === "offline"'), true);
  assert.equal(helper.includes("window.location.href = target.href"), true);
  assert.equal(screen.includes("window.location.href = new URL(APP_ENTRY_PATH"), true);
});

test("service worker installs a complete offline release before it can become waiting", () => {
  const serviceWorker = read("public/sw.js");
  assert.equal(/const OFFLINE_RELEASE = \"v[0-9]+\";/.test(serviceWorker), true);
  assert.equal(serviceWorker.includes("WORKSPACE_CACHE"), true);
  assert.equal(serviceWorker.includes("prepareOfflineRelease"), true);
  assert.equal(serviceWorker.includes("Promise.all(WORKSPACE_ROUTES.map((path) => precacheWorkspacePath(path)))"), true);
  assert.equal(serviceWorker.includes("await cacheDocumentAssets(response, request.url, true)"), true);
  assert.equal(serviceWorker.includes("await Promise.all([caches.delete(RUNTIME_CACHE), caches.delete(WORKSPACE_CACHE)])"), true);
  assert.equal(serviceWorker.includes('event.waitUntil(prepareOfflineRelease())'), true);
  assert.equal(serviceWorker.includes('"GET_OFFLINE_STATUS"'), true);
  assert.equal(serviceWorker.includes('"/app.webmanifest"'), true);
  assert.equal(serviceWorker.includes('"/brand/poolamkoo-mark.svg"'), true);
  assert.equal(serviceWorker.includes('decodeURIComponent(value)'), true);
  assert.equal(serviceWorker.includes('decoded.startsWith("#")'), true);
  assert.equal(serviceWorker.includes("SET_ACCOUNT_SCOPE"), false);
  assert.equal(serviceWorker.includes("/api/auth/logout"), false);
});

test("offline market mode stops new network price requests and keeps cached quotes", () => {
  const hook = read("hooks/use-market.ts");
  assert.equal(hook.includes("useNetworkStatus"), true);
  assert.equal(hook.includes("if (!online)"), true);
  assert.equal(hook.includes("latestCachedQuotes()"), true);
  assert.equal(hook.includes("قیمت تازه دریافت نمی‌شود"), true);
});

test("every income-plan entry point uses the cached income route", () => {
  const list = read("components/sections/income.tsx");
  const page = read("app/(workspace)/income/page.tsx");
  const newMoney = read("components/new-money-dialog.tsx");
  const activity = read("lib/activity.ts");
  assert.equal(list.includes("/income?plan="), true);
  assert.equal(page.includes('searchParams.get("plan")'), true);
  assert.equal(page.includes("<IncomePlanPage"), true);
  assert.equal(newMoney.includes("/income?plan=${incomeId}"), true);
  assert.equal(newMoney.includes("/income/${incomeId}"), false);
  assert.equal(activity.includes("/income?plan=${income.id}"), true);
  assert.equal(activity.includes("/income/${income.id}"), false);
});

test("legacy dynamic income URLs redirect to the cached query route when offline", () => {
  const serviceWorker = read("public/sw.js");
  assert.equal(serviceWorker.includes("legacyIncomeRedirect"), true);
  assert.equal(serviceWorker.includes("/income?plan=${match[1]}"), true);
});
