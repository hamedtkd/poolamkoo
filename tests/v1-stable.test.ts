import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_VERSION, LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("v1.0.0 stable uses one canonical version without a database schema bump", () => {
  const pkg = JSON.parse(read("package.json")) as { version: string };
  const lock = JSON.parse(read("package-lock.json")) as { version: string; packages: Record<string, { version?: string }> };
  assert.equal(APP_VERSION, "1.0.0");
  assert.equal(pkg.version, "1.0.0");
  assert.equal(lock.version, "1.0.0");
  assert.equal(lock.packages[""]?.version, "1.0.0");
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 8);
});

test("stable gate composes the full production release gate before metadata acceptance", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const checker = read("scripts/check-v1-stable.mjs");
  assert.equal(pkg.scripts["check:stable"], "npm run check:release && node scripts/check-v1-stable.mjs");
  assert.equal(checker.includes("Full production release gate completed"), true);
  assert.equal(checker.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), true);
});

test("stable documentation records accepted RC3 promotion without feature expansion", () => {
  const release = read("docs/releases/1.0.0.md");
  const acceptance = read("docs/audits/v1.0.0-acceptance.md");
  const roadmap = read("docs/ROADMAP.md");
  const cleanup = read("scripts/remove-obsolete-routes.mjs");
  assert.equal(release.includes("First stable release"), true);
  assert.equal(release.includes("Manual Acceptance"), true);
  assert.equal(release.includes("schema 8"), true);
  assert.equal(acceptance.includes("PASS → آماده انتشار `v1.0.0` stable"), true);
  assert.equal(acceptance.includes("Desktop guide"), true);
  assert.equal(acceptance.includes("Backup → Restore"), true);
  assert.equal(acceptance.includes("old-tab"), true);
  assert.equal(roadmap.includes("v1.0.0-rc.3 — Product-tour masked spotlight stabilization ✅"), true);
  assert.equal(roadmap.includes("v1.0.0 — First stable release ✅"), true);
  assert.equal(cleanup.includes('"scripts/check-v1-rc.mjs"'), true);
  assert.equal(cleanup.includes('"tests/v1-rc.test.ts"'), true);
});
