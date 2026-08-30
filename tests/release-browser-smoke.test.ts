import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
const smoke = readFileSync("scripts/release-browser-smoke.mjs", "utf8");
const workflow = readFileSync(".github/workflows/release-smoke.yml", "utf8");

test("release browser gate adds no browser automation dependency", () => {
  const installed = { ...packageJson.dependencies, ...packageJson.devDependencies };
  assert.equal(installed.playwright, undefined);
  assert.equal(installed["@playwright/test"], undefined);
  assert.equal(installed.cypress, undefined);
});

test("release command builds once and runs the production browser gate", () => {
  assert.equal(packageJson.scripts?.["test:browser:release"], "npm run build && node scripts/release-browser-smoke.mjs");
  assert.equal(packageJson.scripts?.["test:browser:release:built"], "node scripts/release-browser-smoke.mjs");
  assert.equal(packageJson.scripts?.["check:release"], "npm run check && npm run build && npm run test:browser:release:built");
});

test("release smoke uses an isolated profile and blocks remote financial integrations", () => {
  assert.match(smoke, /mkdtemp\(join\(tmpdir\(\), "poolamkoo-release-smoke-"\)\)/);
  assert.match(smoke, /Storage\.clearDataForOrigin/);
  assert.match(smoke, /\*\/api\/market\*/);
  assert.match(smoke, /\*\/api\/push\/\*/);
  assert.doesNotMatch(smoke, /user-data-dir=.*(?:Default|Profile)/);
});

test("release smoke covers landing, dashboard/dialog visibility, reports and PWA boundaries", () => {
  for (const contract of [
    "public theme toggle hydration",
    "legacy schema 6 fixture must use native IndexedDB version 60",
    "schema 6 profile must upgrade in place through schema 8",
    "schema 8 migration must create an opening fund-ledger row for legacy balances",
    "legacy linked assets must normalize to Tindex during schema 7 migration",
    "Tindex and TSETMC rows with the same raw marketId must coexist after migration",
    "migration fixture cleanup must restore a fresh public origin",
    "hydrated public theme toggle must be clickable",
    "landing-to-workspace navigation",
    "fresh onboarding",
    "persisted onboarding completion",
    "dashboard critical content must be visible with normal motion preference",
    "workspace must compile tailwindcss-animated stagger utilities with distinct delays",
    "shared dialog content must never render blank under normal motion preference",
    "reports must expose privacy-safe export controls",
    "drag-to-dismiss mobile drawer",
    "جمع‌بندی تصمیمی این بازه",
    "workspace service worker registration",
    "manifest start_url must be /dashboard",
    "public landing must not advertise the installable manifest",
  ]) assert.ok(smoke.includes(contract), `missing browser smoke contract: ${contract}`);
});

test("manual GitHub release smoke runs the same release gate", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
  assert.match(workflow, /npm run check:release/);
  assert.match(workflow, /node-version: 22/);
});
