import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };
const capture = readFileSync("scripts/capture-product-media.mjs", "utf8");
const demo = readFileSync("scripts/media/demo-data.mjs", "utf8");
const workflow = readFileSync(".github/workflows/product-media.yml", "utf8");
const docs = readFileSync("docs/assets/README.md", "utf8");
const readme = readFileSync("README.md", "utf8");

test("product media commands capture the production build with isolated demo data", () => {
  assert.match(packageJson.scripts["media:capture"], /npm run build/);
  assert.match(packageJson.scripts["media:capture:built"], /capture-product-media/);
  assert.match(capture, /Storage\.clearDataForOrigin/);
  assert.match(capture, /poolyar-local/);
  assert.match(capture, /mkdtemp/);
  assert.match(capture, /Network\.setBlockedURLs/);
  assert.match(capture, /Runtime\.exceptionThrown/);
  assert.match(capture, /spawn\(process\.execPath/);
  assert.doesNotMatch(capture, /npm\.cmd/);
  assert.match(capture, /landing-dark-desktop\.png/);
  assert.match(demo, /onboardingComplete: true/);
  assert.match(demo, /Fixture نمایشی/);
});

test("manual GitHub media workflow produces a downloadable screenshot artifact", () => {
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run media:capture/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /poolamkoo-product-screenshots/);
  assert.match(docs, /Product media/);
  assert.match(docs, /Browser Profile موقت/);
  assert.match(readme, /docs\/assets\/screenshots\/dashboard-light-desktop\.png/);
});
