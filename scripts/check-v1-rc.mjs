import { readFile } from "node:fs/promises";

const VERSION = "1.0.0-rc.3";

async function read(path) {
  return readFile(path, "utf8");
}

const [packageSource, lockSource, appVersionSource, releaseSource, acceptanceSource, roadmapSource, tourSource, tourHookSource, smokeSource] = await Promise.all([
  read("package.json"),
  read("package-lock.json"),
  read("lib/app-version.ts"),
  read("docs/releases/1.0.0-rc.3.md"),
  read("docs/audits/v1-rc3-acceptance.md"),
  read("docs/ROADMAP.md"),
  read("components/app/product-tour.tsx"),
  read("hooks/use-product-tour.ts"),
  read("scripts/release-browser-smoke.mjs"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const checks = [
  [pkg.version === VERSION, "package.json version must match the release candidate"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match the release candidate"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match the release candidate"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "release candidate must not bump IndexedDB schema"],
  [releaseSource.includes("Feature freeze") && releaseSource.includes("schema 8") && releaseSource.includes("data-tour-target") && releaseSource.includes("1280×900"), "release note must preserve the RC boundary and document deterministic tour stabilization"],
  [acceptanceSource.includes("Chromium desktop") && acceptanceSource.includes("Backup → Restore") && acceptanceSource.includes("old-tab") && acceptanceSource.includes("راهنمای سریع"), "RC acceptance doc must retain the manual release gates and guide recheck"],
  [roadmapSource.includes("v1.0.0-rc.3 — Product-tour masked spotlight stabilization"), "roadmap must identify the active release candidate"],
  [tourSource.includes('data-tour-overlay="masked"') && tourSource.includes('data-tour-target={targetName}') && tourSource.includes('mask={`url(#${MASK_ID})`}'), "RC3 must ship the target-linked SVG mask product-tour spotlight"],
  [tourHookSource.includes("ResizeObserver") && tourHookSource.includes("attempts < 18") && tourHookSource.includes("targetElement"), "RC3 must retry and keep spotlight geometry aligned with the real target element"],
  [smokeSource.includes('width: 1280, height: 900') && smokeSource.includes('activeSpotlight') && smokeSource.includes('missing exact target, spotlight, or masked overlay'), "RC3 browser gate must use deterministic desktop metrics and exact-target diagnostics"],
];

for (const [ok, message] of checks) {
  if (!ok) {
    console.error(`RC readiness check failed: ${message}`);
    process.exit(1);
  }
}

console.log("v1.0.0-rc.3 automated RC metadata gate passed. Manual RC acceptance checks are still required before v1.0.0 stable.");
