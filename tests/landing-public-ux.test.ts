import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hero = readFileSync("components/landing/landing-hero.tsx", "utf8");
const cinematic = readFileSync("components/ui/cinematic-landing-hero.tsx", "utf8");
const sections = readFileSync("components/landing/landing-sections.tsx", "utf8");
const motionReveal = readFileSync("components/motion/reveal.tsx", "utf8");
const visual = readFileSync("components/landing/landing-product-visual.tsx", "utf8");
const shell = readFileSync("components/public/public-shell.tsx", "utf8");
const themeToggle = readFileSync("components/public/public-theme-toggle.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("critical landing hero stays readable before animation hydration", () => {
  assert.match(hero, /CinematicLandingHero/);
  assert.match(cinematic, /پول می‌رسد/);
  assert.match(cinematic, /initial=\{false\}/);
  assert.doesNotMatch(cinematic, /visibility:\s*hidden|gsap-reveal/);
  assert.match(visual, /data-landing-visual="product"/);
});

test("public header exposes a standalone theme control without touching IndexedDB", () => {
  assert.match(shell, /PublicThemeToggle/);
  assert.match(themeToggle, /useTheme/);
  assert.match(themeToggle, /setTheme/);
  assert.doesNotMatch(themeToggle, /@\/lib\/db|useAppTheme/);
  assert.match(themeToggle, /prefers-reduced-motion: reduce/);
  assert.match(themeToggle, /data-hydrated=\{hydrated \? "true" : "false"\}/);
});

test("landing keeps load-safe CSS motion and uses reduced-motion aware interaction", () => {
  assert.match(css, /@keyframes landing-enter/);
  assert.match(css, /@keyframes landing-float/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.cinematic-grid/);
  assert.match(css, /\.landing-visual-float/);
  assert.match(cinematic, /useReducedMotion/);
  assert.match(sections, /MotionReveal/);
  assert.match(motionReveal, /whileInView/);
  assert.match(motionReveal, /type: "spring"/);
  assert.match(cinematic, /landing-copy-step-6/);
  assert.doesNotMatch(motionReveal, /opacity:\s*0[},]/);
  assert.doesNotMatch(sections, /direction="left"|direction="right"/);
});
