import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [revealSource, motionRevealSource, dialogSource, shellSource, smokeSource, cssSource, githubStatsSource, exchangePickerSource, dashboardSource, settingsSource, reportsSource, packageSource, providersSource, landingSectionsSource] = await Promise.all([
  readFile(new URL("../components/animation/reveal.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/motion/reveal.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/ui/dialog.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/app-shell.tsx", import.meta.url), "utf8"),
  readFile(new URL("../scripts/release-browser-smoke.mjs", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../hooks/use-github-stats.ts", import.meta.url), "utf8"),
  readFile(new URL("../components/investments/exchange-instrument-picker.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/sections/dashboard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/sections/settings.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/sections/reports.tsx", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../components/providers.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/landing/landing-sections.tsx", import.meta.url), "utf8"),
]);

test("workspace uses Tailwind stagger while Motion stays available for viewport interactions", () => {
  assert.match(cssSource, /@import "tailwindcss-animated\/src\/index\.css";/);
  assert.match(packageSource, /"tailwindcss-animated": "2\.1\.0"/);
  assert.match(packageSource, /"motion": "\^12\.0\.0"/);
  assert.doesNotMatch(providersSource, /MotionConfig|motion\/react/);
  assert.doesNotMatch(shellSource, /RouteTransition|MotionReveal|motion\/react/);
  assert.match(shellSource, /<div data-route-content=\{pathname\}[^>]*>\{children\}<\/div>/);
  assert.match(revealSource, /animate-fade-up/);
  assert.match(revealSource, /animate-fade-down/);
  assert.match(revealSource, /animate-fade-left/);
  assert.match(revealSource, /animate-fade-right/);
  assert.match(revealSource, /animate-delay-\[55ms\]/);
  assert.match(revealSource, /animate-delay-\[440ms\]/);
  assert.match(revealSource, /motion-reduce:animate-none/);
  assert.match(motionRevealSource, /whileInView/);
  assert.match(motionRevealSource, /viewport=\{\{ once: true, amount \}\}/);
  assert.match(landingSectionsSource, /MotionReveal/);
});

test("workspace cards stagger individually in one calm top-to-bottom direction", () => {
  assert.match(dashboardSource, /<Reveal direction="down" step=\{1\}>/);
  assert.match(dashboardSource, /<Reveal hover step=\{2\}/);
  assert.match(settingsSource, /<RevealGrid[^>]*startStep=\{1\}/);
  assert.match(reportsSource, /<RevealGrid[^>]*startStep=\{2\}/);
  for (const source of [dashboardSource, settingsSource, reportsSource]) {
    assert.doesNotMatch(source, /direction="(?:left|right)"|flow="sides"/);
  }
  assert.doesNotMatch(cssSource, /workspace-item-enter|workspace-stagger/);
});

test("shared dialogs stay visible with transform-only CSS motion and never depend on Motion hydration", () => {
  assert.doesNotMatch(dialogSource, /motion\/react|<m\.|data-motion-dialog-body/);
  assert.match(dialogSource, /data-dialog-content/);
  assert.match(dialogSource, /safe-modal-motion/);
  assert.doesNotMatch(dialogSource, /contentMotion = .*animate-fade/);
  assert.match(cssSource, /poolamkoo-modal-enter/);
});

test("GitHub stats cannot surface an AbortError from Promise fetch teardown", () => {
  assert.doesNotMatch(githubStatsSource, /AbortController|AbortSignal|\.abort\(/);
  assert.doesNotMatch(githubStatsSource, /\bfetch\s*\(/);
  assert.match(githubStatsSource, /new XMLHttpRequest\(\)/);
  assert.match(githubStatsSource, /request\.send\(\)/);
  assert.match(githubStatsSource, /let active = true/);
  assert.match(githubStatsSource, /active = false/);
  assert.doesNotMatch(exchangePickerSource, /AbortController|\.abort\(/);
  assert.match(exchangePickerSource, /requestIdRef/);
});

test("release browser gate proves client navigation, dialog visibility and compiled stagger motion", () => {
  assert.match(smokeSource, /async function clientNavigate/);
  assert.match(smokeSource, /__poolamkooClientNavMarker/);
  assert.match(smokeSource, /workspace content must remain visible after client navigation/);
  assert.match(smokeSource, /workspace must compile tailwindcss-animated stagger utilities with distinct delays/);
  assert.match(smokeSource, /shared dialog content must never render blank under normal motion preference/);
  assert.match(smokeSource, /clientNavigate\(client, "\/reports"/);
  assert.match(smokeSource, /clientNavigate\(client, "\/settings"/);
  assert.doesNotMatch(smokeSource, /AbortError\|ResizeObserver/);
});
