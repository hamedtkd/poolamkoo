import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("v0.43 readiness hardening remains the schema-8 baseline", () => {
  const release = read("docs/releases/0.43.0.md");
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 8);
  assert.equal(release.includes("schema 8"), true);
  assert.equal(release.includes("network-only"), true);
});

test("generic workspace errors do not perform database repair", () => {
  const source = read("app/(workspace)/error.tsx");
  const dataHealth = read("components/settings/data-health-card.tsx");
  assert.equal(source.includes("repairLocalData"), false);
  assert.equal(source.includes("بازسازی داده"), false);
  assert.equal(source.includes('/settings#local-data-health'), true);
  assert.equal(source.includes('/data-safety'), true);
  assert.equal(dataHealth.includes('id="local-data-health"'), true);
  assert.equal(dataHealth.includes("repairSafeLocalDataHealth"), true);
});

test("public routes stay outside the workspace runtime navigation cache", () => {
  const serviceWorker = read("public/sw.js");
  const releaseSmoke = read("scripts/release-browser-smoke.mjs");
  assert.equal(serviceWorker.includes('const CACHE = "poolamkoo-v71"'), true);
  assert.equal(serviceWorker.includes("WORKSPACE_NAVIGATION_PREFIXES"), true);
  assert.equal(serviceWorker.includes("!isWorkspaceNavigation(url.pathname)"), true);
  assert.equal(releaseSmoke.includes("workspace service worker must not cache the public landing navigation"), true);
});

test("PWA Later suppresses the same waiting worker without auto-activating it", () => {
  const hook = read("hooks/use-pwa-update.ts");
  const serviceWorker = read("public/sw.js");
  assert.equal(hook.includes("dismissedWaitingWorkerRef.current = registrationRef.current?.waiting ?? null"), true);
  assert.equal(hook.includes("dismissedWaitingWorkerRef.current === waiting"), true);
  assert.equal(hook.includes("waiting.postMessage({ type: PWA_UPDATE_MESSAGE })"), true);
  assert.equal(serviceWorker.includes('event.data?.type === "SKIP_WAITING"'), true);
});

test("v1 readiness audit and release note document the hardened boundaries", () => {
  const release = read("docs/releases/0.43.0.md");
  const audit = read("docs/audits/v1-readiness-v0.43.md");
  const roadmap = read("docs/ROADMAP.md");
  assert.equal(release.includes("network-only"), true);
  assert.equal(release.includes("schema 8"), true);
  assert.equal(audit.includes("Ready for a v1.0 release-candidate pass"), true);
  assert.equal(audit.includes("Generic error recovery"), true);
  assert.equal(roadmap.includes("v0.43 — v1.0 readiness hardening ✅"), true);
  assert.equal(roadmap.includes("v1.0.0-rc.3 — Product-tour masked spotlight stabilization ✅"), true);
  assert.equal(roadmap.includes("v1.0.0 — First stable release ✅"), true);
  assert.equal(read("docs/releases/1.0.0.md").includes("First stable release"), true);
  assert.equal(read("docs/audits/v1.0.0-acceptance.md").includes("PASS → آماده انتشار `v1.0.0` stable"), true);
  assert.equal(roadmap.includes("v1.0.1 — Public launch & quota hardening ✅"), true);
  assert.equal(read("docs/releases/1.0.1.md").includes("Public launch & quota hardening"), true);
});
