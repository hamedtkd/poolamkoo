import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const visual = readFileSync("components/landing/landing-product-visual.tsx", "utf8");
const hero = readFileSync("components/landing/landing-hero.tsx", "utf8");

test("landing uses a real isolated Poolamkoo product capture inside the cinematic hero", () => {
  assert.match(hero, /CinematicLandingHero/);
  assert.match(visual, /poolamkoo-income-mobile\.webp/);
  assert.match(visual, /data-landing-visual="product"/);
  assert.ok(statSync("public/landing/poolamkoo-income-mobile.webp").size > 20_000);
  assert.ok(statSync("public/landing/poolamkoo-income-mobile.webp").size < 150_000);
});

test("landing visual keeps demo provenance without adding a visible disclaimer under the hero", () => {
  assert.match(visual, /data-demo="true"/);
  assert.match(visual, /داده نمایشی/);
  assert.doesNotMatch(visual, /اسکرین‌شات واقعی محصول با داده نمایشی/);
  assert.doesNotMatch(visual, /هیچ داده مالی شخصی/);
  assert.doesNotMatch(visual, /figcaption/);
});
