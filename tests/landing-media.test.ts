import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const visual = readFileSync("components/landing/landing-product-visual.tsx", "utf8");
const hero = readFileSync("components/landing/landing-hero.tsx", "utf8");

test("landing uses the approved light and dark product visuals", () => {
  assert.match(hero, /LandingProductVisual/);
  assert.match(visual, /poolamkoo-finance-light\.webp/);
  assert.match(visual, /poolamkoo-finance-dark\.webp/);
  assert.match(visual, /dark:hidden/);
  assert.match(visual, /dark:block/);
  assert.ok(statSync("public/landing/poolamkoo-finance-light.webp").size > 50_000);
  assert.ok(statSync("public/landing/poolamkoo-finance-dark.webp").size > 50_000);
});

test("landing visual clearly labels its numbers as sample presentation data", () => {
  assert.match(visual, /داده‌های نمایش‌داده‌شده نمونه‌اند/);
});
