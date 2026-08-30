import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_VERSION, LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("v1 RC2 uses one canonical prerelease version without a database schema bump", () => {
  const pkg = JSON.parse(read("package.json")) as { version: string };
  const lock = JSON.parse(read("package-lock.json")) as { version: string; packages: Record<string, { version?: string }> };
  assert.equal(APP_VERSION, "1.0.0-rc.2");
  assert.equal(pkg.version, "1.0.0-rc.2");
  assert.equal(lock.version, "1.0.0-rc.2");
  assert.equal(lock.packages[""]?.version, "1.0.0-rc.2");
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 8);
});

test("RC gate composes the full production release gate before metadata acceptance", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const checker = read("scripts/check-v1-rc.mjs");
  assert.equal(pkg.scripts["check:rc"], "npm run check:release && node scripts/check-v1-rc.mjs");
  assert.equal(checker.includes("Manual RC acceptance checks are still required"), true);
  assert.equal(checker.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), true);
});

test("RC2 documentation keeps feature freeze and product-tour recheck explicit", () => {
  const release = read("docs/releases/1.0.0-rc.2.md");
  const acceptance = read("docs/audits/v1-rc2-acceptance.md");
  const roadmap = read("docs/ROADMAP.md");
  assert.equal(release.includes("Feature freeze"), true);
  assert.equal(release.includes("Spotlight"), true);
  assert.equal(release.includes("Backup/Recovery/Device Transfer"), true);
  assert.equal(acceptance.includes("راهنمای سریع Desktop/Mobile"), true);
  assert.equal(acceptance.includes("Chromium desktop"), true);
  assert.equal(acceptance.includes("old-tab"), true);
  assert.equal(acceptance.includes("No feature expansion"), true);
  assert.equal(roadmap.includes("v1.0.0-rc.2 — Product tour release-blocker fix"), true);
  assert.equal(roadmap.includes("v1.0.0 stable"), true);
});
