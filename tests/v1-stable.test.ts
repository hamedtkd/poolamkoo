import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_VERSION, LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";

const read = (path: string) => readFileSync(path, "utf8");

test("v1.0.1 launch patch uses one canonical version without a database schema bump", () => {
  const pkg = JSON.parse(read("package.json")) as { version: string };
  const lock = JSON.parse(read("package-lock.json")) as { version: string; packages: Record<string, { version?: string }> };
  assert.equal(APP_VERSION, "1.0.1");
  assert.equal(pkg.version, "1.0.1");
  assert.equal(lock.version, "1.0.1");
  assert.equal(lock.packages[""]?.version, "1.0.1");
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 8);
});

test("stable gate composes the full production release gate before v1.0.1 metadata acceptance", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const checker = read("scripts/check-v1-stable.mjs");
  assert.equal(pkg.scripts["check:stable"], "npm run check:release && node scripts/check-v1-stable.mjs");
  assert.equal(checker.includes("v1.0.1 stable metadata gate passed"), true);
  assert.equal(checker.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), true);
});

test("v1.0.1 documentation records launch hardening without feature expansion", () => {
  const release = read("docs/releases/1.0.1.md");
  const acceptance = read("docs/audits/v1.0.1-launch-readiness.md");
  const roadmap = read("docs/ROADMAP.md");
  assert.equal(release.includes("Public launch & quota hardening"), true);
  assert.equal(release.includes("1500 request/day"), true);
  assert.equal(release.includes("schema 8"), true);
  assert.equal(acceptance.includes("Fluid Compute Enabled"), true);
  assert.equal(acceptance.includes("24 ساعت"), true);
  assert.equal(roadmap.includes("v1.0.0 — First stable release ✅"), true);
  assert.equal(roadmap.includes("v1.0.1 — Public launch & quota hardening 🚧"), true);
});
