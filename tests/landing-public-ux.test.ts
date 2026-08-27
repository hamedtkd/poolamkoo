import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hero = readFileSync("components/landing/landing-hero.tsx", "utf8");
const sections = readFileSync("components/landing/landing-sections.tsx", "utf8");
const motionReveal = readFileSync("components/motion/reveal.tsx", "utf8");
const visual = readFileSync("components/landing/landing-product-visual.tsx", "utf8");
const shell = readFileSync("components/public/public-shell.tsx", "utf8");
const themeToggle = readFileSync("components/public/public-theme-toggle.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("critical landing hero remains visible without Motion hydration", () => {
  assert.doesNotMatch(hero, /MotionReveal/);
  assert.match(hero, /LandingProductVisual/);
  assert.match(hero, /landing-enter/);
  assert.match(visual, /data-landing-visual="light"/);
  assert.match(visual, /data-landing-visual="dark"/);
});

test("public header exposes a standalone theme control without touching IndexedDB", () => {
  assert.match(shell, /PublicThemeToggle/);
  assert.match(themeToggle, /useTheme/);
  assert.match(themeToggle, /setTheme/);
  assert.doesNotMatch(themeToggle, /@\/lib\/db|useAppTheme/);
  assert.match(themeToggle, /prefers-reduced-motion: reduce/);
});

test("landing keeps load-safe CSS hero motion and uses Motion for scroll reveals", () => {
  assert.match(css, /@keyframes landing-enter/);
  assert.match(css, /@keyframes landing-float/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.landing-visual-float/);
  assert.match(sections, /MotionReveal/);
  assert.match(motionReveal, /whileInView/);
  assert.match(motionReveal, /useReducedMotion/);
  assert.doesNotMatch(motionReveal, /opacity:\s*0[},]/);
});
