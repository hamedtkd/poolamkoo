import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { APP_VERSION, LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";

const read = (path: string) => readFileSync(path, "utf8");
const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

const BRAND_SOURCES = {
  mark: "fabbfff77baacc3480ada96e505980b1ea879385eda10c034ce6e151fc0c9d4b",
  dark: "9d1f72084f83b7098f302e27cabdaa616fc7ab54c7e8508d411252b588f2bdb1",
  fa: "5f0335d3314e8495cb1ec497b28c30113635244e88d7352d287744b2abce5317",
  en: "963971d37d437030a289e9fea26a0496ef22f018d58985ff556b8fba3426a279",
};

test("v1.1.0 settings release uses one canonical version without a database schema bump", () => {
  const pkg = JSON.parse(read("package.json")) as { version: string };
  const lock = JSON.parse(read("package-lock.json")) as { version: string; packages: Record<string, { version?: string }> };
  assert.equal(APP_VERSION, "1.1.0");
  assert.equal(pkg.version, "1.1.0");
  assert.equal(lock.version, "1.1.0");
  assert.equal(lock.packages[""]?.version, "1.1.0");
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 8);
});

test("accepted SVG masters remain pinned while the PWA cache advances", () => {
  const brand = read("components/brand-logo.tsx");
  const manifest = read("public/app.webmanifest");
  const serviceWorker = read("public/sw.js");
  assert.equal(sha256("public/brand/poolamkoo-mark.svg"), BRAND_SOURCES.mark);
  assert.equal(sha256("public/brand/poolamkoo-dark.svg"), BRAND_SOURCES.dark);
  assert.equal(sha256("public/brand/poolamkoo-fa-lockup.svg"), BRAND_SOURCES.fa);
  assert.equal(sha256("public/brand/poolamkoo-en-lockup.svg"), BRAND_SOURCES.en);
  assert.equal(brand.includes('/brand/poolamkoo-mark.svg'), true);
  assert.equal(brand.includes("MaskImage"), true);
  assert.equal(manifest.includes('"name": "پولم‌کو"'), true);
  assert.equal(serviceWorker.includes('const CACHE = "poolamkoo-v70"'), true);
});

test("stable gate composes the full production release gate before v1.1.0 settings acceptance", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const checker = read("scripts/check-v1-stable.mjs");
  assert.equal(pkg.scripts["check:stable"], "npm run check:release && node scripts/check-v1-stable.mjs");
  assert.equal(checker.includes("v1.1.0 stable metadata gate passed"), true);
  assert.equal(checker.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), true);
  assert.equal(checker.includes("settingsSearchItems.map"), true);
  assert.equal(checker.includes("CustomThemeColorDialog"), true);
  assert.equal(checker.includes("setCustomPalette"), true);
});

test("v1.1.0 documentation records categorized settings and shared search", () => {
  const release = read("docs/releases/1.1.0.md");
  const roadmap = read("docs/ROADMAP.md");
  assert.equal(release.includes("Searchable settings architecture"), true);
  assert.equal(release.includes("جست‌وجوی سراسری"), true);
  assert.equal(release.includes("رنگ‌ساز سفارشی"), true);
  assert.equal(release.includes("schema 8"), true);
  assert.equal(roadmap.includes("v1.1.0 — Searchable settings architecture 🚧"), true);
});
