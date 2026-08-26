import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [motionSource, shellSource, smokeSource] = await Promise.all([
  readFile(new URL("../components/motion/reveal.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/app-shell.tsx", import.meta.url), "utf8"),
  readFile(new URL("../scripts/release-browser-smoke.mjs", import.meta.url), "utf8"),
]);

test("workspace route transition never hides the whole route during client navigation", () => {
  assert.match(shellSource, /<RouteTransition routeKey=\{pathname\}>\{children\}<\/RouteTransition>/);
  assert.doesNotMatch(motionSource, /AnimatePresence/);
  const routeTransition = motionSource.slice(
    motionSource.indexOf("export function RouteTransition"),
    motionSource.indexOf("export function MotionReveal"),
  );
  assert.doesNotMatch(routeTransition, /opacity\s*:/);
  assert.match(routeTransition, /data-route-content=\{routeKey\}/);
});

test("release browser gate proves workspace links navigate without document reload or blank content", () => {
  assert.match(smokeSource, /async function clientNavigate/);
  assert.match(smokeSource, /__poolamkooClientNavMarker/);
  assert.match(smokeSource, /workspace content must remain visible after client navigation/);
  assert.match(smokeSource, /clientNavigate\(client, "\/reports"/);
  assert.match(smokeSource, /clientNavigate\(client, "\/settings"/);
});
