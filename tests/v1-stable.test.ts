import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";
import { APP_VERSION, LOCAL_DATABASE_SCHEMA_VERSION } from "../lib/app-version.ts";

const read = (path: string) => readFileSync(path, "utf8");
const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const SHOWCASE = [
  "docs/assets/showcase/poolamkoo-overview-en.webp",
  "docs/assets/showcase/income-planning-en.webp",
  "docs/assets/showcase/funds-goals-en.webp",
  "docs/assets/showcase/reports-insights-en.webp",
  "docs/assets/showcase/settings-themes-en.webp",
];

const BRAND_SOURCES = {
  mark: "fabbfff77baacc3480ada96e505980b1ea879385eda10c034ce6e151fc0c9d4b",
  dark: "9d1f72084f83b7098f302e27cabdaa616fc7ab54c7e8508d411252b588f2bdb1",
  fa: "5f0335d3314e8495cb1ec497b28c30113635244e88d7352d287744b2abce5317",
  en: "963971d37d437030a289e9fea26a0496ef22f018d58985ff556b8fba3426a279",
};

test("v1.1.1 UX patch uses one canonical version without a database schema bump", () => {
  const pkg = JSON.parse(read("package.json")) as { version: string };
  const lock = JSON.parse(read("package-lock.json")) as { version: string; packages: Record<string, { version?: string }> };
  assert.equal(APP_VERSION, "1.1.1");
  assert.equal(pkg.version, "1.1.1");
  assert.equal(lock.version, "1.1.1");
  assert.equal(lock.packages[""]?.version, "1.1.1");
  assert.equal(LOCAL_DATABASE_SCHEMA_VERSION, 8);
});

test("pending investment purchases collapse the repeated card wall without losing exact plan actions", () => {
  const source = read("components/investments/pending-plan-purchases.tsx");
  assert.equal(source.includes("groupByIncome"), true);
  assert.equal(source.includes("MAX_VISIBLE_GROUPS = 4"), true);
  assert.equal(source.includes("open={defaultOpen}"), true);
  assert.equal(source.includes("showAll ? groups : groups.slice"), true);
  assert.equal(source.includes("onBuy(item, asset)"), true);
  assert.equal(source.includes("SensitiveValue"), true);
  assert.equal(source.includes('className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3"'), true);
});

test("GitHub showcase uses optimized English panels while exact screenshots remain separate", () => {
  const readme = read("README.md");
  const readmeFa = read("README.fa.md");
  const docs = read("docs/assets/showcase/README.md");
  for (const path of SHOWCASE) {
    assert.equal(statSync(path).size > 50_000, true);
    assert.equal(readme.includes(`./${path}`), true);
    assert.equal(readmeFa.includes(`./${path}`), true);
  }
  assert.equal(readme.includes("promotional compositions rather than pixel-exact screenshots"), true);
  assert.equal(docs.includes("Persian presentation variants are intentionally kept outside the repository"), true);
  assert.equal(readme.includes("./docs/assets/screenshots/dashboard-light-desktop.png"), true);
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
  assert.equal(serviceWorker.includes('const CACHE = "poolamkoo-v71"'), true);
});

test("stable gate composes the full production release gate before v1.1.1 UX acceptance", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const checker = read("scripts/check-v1-stable.mjs");
  assert.equal(pkg.scripts["check:stable"], "npm run check:release && node scripts/check-v1-stable.mjs");
  assert.equal(checker.includes("v1.1.1 stable metadata gate passed"), true);
  assert.equal(checker.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), true);
  assert.equal(checker.includes("MAX_VISIBLE_GROUPS = 4"), true);
  assert.equal(checker.includes("settingsSearchItems.map"), true);
  assert.equal(checker.includes("CustomThemeColorDialog"), true);
});

test("v1.1.1 documentation records the compact queue and GitHub media decision", () => {
  const release = read("docs/releases/1.1.1.md");
  const roadmap = read("docs/ROADMAP.md");
  assert.equal(release.includes("Investment queue UX & GitHub showcase"), true);
  assert.equal(release.includes("چهار گروه"), true);
  assert.equal(release.includes("schema 8"), true);
  assert.equal(roadmap.includes("v1.1.0 — Searchable settings architecture ✅"), true);
  assert.equal(roadmap.includes("v1.1.1 — Investment queue UX & GitHub media 🚧"), true);
});


test("v1.1.1 financial semantics and landing polish stay part of the release contract", () => {
  const format = read("lib/format.ts");
  const css = read("app/globals.css");
  const dashboard = read("components/sections/dashboard.tsx");
  const hero = read("components/ui/cinematic-landing-hero.tsx");
  const visual = read("components/landing/landing-product-visual.tsx");
  const release = read("docs/releases/1.1.1.md");
  assert.equal(format.includes('new Intl.NumberFormat("en-US"'), true);
  assert.equal(format.includes("formatSignedMoney"), true);
  assert.equal(format.includes("formatSignedPercent"), true);
  assert.equal(css.includes("--profit: #15803d"), true);
  assert.equal(css.includes("--loss: #f87171"), true);
  assert.equal(dashboard.includes("سود باز"), true);
  assert.equal(dashboard.includes("زیان باز"), true);
  assert.equal(hero.includes("initial={false}"), true);
  assert.equal(hero.includes("useReducedMotion"), true);
  assert.equal(hero.includes("landing-copy-step-6"), true);
  assert.equal(visual.includes("poolamkoo-income-mobile.webp"), true);
  assert.equal(release.includes("comma استاندارد"), true);
});
