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

test("release smoke covers landing, onboarding bootstrap, reports and PWA boundaries", () => {
  for (const contract of [
    "landing-to-workspace navigation",
    "fresh onboarding",
    "persisted onboarding completion",
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
