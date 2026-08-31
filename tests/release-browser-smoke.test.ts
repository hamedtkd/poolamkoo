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
    "product tour must leave the highlighted control visually outside the overlay",
    "desktop product tour new-money spotlight",
    "missing exact target, spotlight, or masked overlay",
    "width: 1280, height: 900",
    "width: 425, height: 800",
    "spotlight geometry did not settle inside the SVG cutout",
    "Product tour spotlight failed for",
    "desktop global search must have a real visible tour target",
    "shared dialog content must never render blank under normal motion preference",
    "pending investment purchases must group repeated asset cards by income and keep only the newest group open",
    "compact pending queue must keep an actionable exact-plan purchase button",
    "reports must expose privacy-safe export controls",
    "settings overview must expose categorized destinations instead of the old card wall",
    "settings search result must be actionable",
    "appearance settings must expose the custom theme color builder",
    "custom theme dialog must expose accessible color controls and live-preview guidance",
    "drag-to-dismiss mobile drawer",
    "جمع‌بندی تصمیمی این بازه",
    "workspace service worker registration",
    "manifest start_url must be /dashboard",
    "public landing must not advertise the installable manifest",
  ]) assert.ok(smoke.includes(contract), `missing browser smoke contract: ${contract}`);
  assert.equal(smoke.includes("پولم‌کو را برای خودت تنظیم کن"), false, "release smoke must not wait on the removed settings wall heading");
  assert.match(smoke, /openGroup\?\.querySelector|openGroup = opened\[0\]/, "pending queue smoke must inspect rows inside the actually open details group");
  assert.equal(smoke.includes("getClientRects().length > 0"), false, "pending queue smoke must not infer details visibility from getClientRects");
});

test("manual GitHub release smoke runs the same release gate", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
  assert.match(workflow, /npm run check:release/);
  assert.match(workflow, /node-version: 22/);
});
