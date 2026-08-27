import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const css = readFileSync("app/globals.css", "utf8");
const dialog = readFileSync("components/ui/dialog.tsx", "utf8");
const alertDialog = readFileSync("components/ui/alert-dialog.tsx", "utf8");
const drawer = readFileSync("components/ui/drawer.tsx", "utf8");
const checker = readFileSync("scripts/check-animation-dependencies.mjs", "utf8");

test("Tailwind animated uses an explicit CSS entry that Turbopack can resolve", () => {
  assert.equal(packageJson.devDependencies?.["tailwindcss-animated"], "2.1.0");
  assert.match(css, /@import "tailwindcss-animated\/src\/index\.css";/);
  assert.doesNotMatch(css, /@import "tailwindcss-animated";/);
  assert.equal(packageJson.scripts?.["check:animations"], "node scripts/check-animation-dependencies.mjs");
  assert.match(packageJson.scripts?.check ?? "", /npm run check:animations/);
  assert.match(checker, /require\.resolve\(specifier\)/);
  assert.match(checker, /motion\/react/);
});

test("shared modal bodies never use fade animations that start at opacity zero", () => {
  assert.match(dialog, /safe-modal-motion/);
  assert.match(alertDialog, /safe-modal-motion/);
  assert.match(drawer, /safe-drawer-motion/);
  assert.doesNotMatch(dialog, /contentMotion = .*animate-fade/);
  assert.match(css, /@keyframes poolamkoo-modal-enter/);
  assert.doesNotMatch(css.match(/@keyframes poolamkoo-modal-enter[\s\S]*?\n}/)?.[0] ?? "", /opacity\s*:/);
});
