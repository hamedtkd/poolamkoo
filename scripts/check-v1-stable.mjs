import { readFile } from "node:fs/promises";

const VERSION = "1.0.0";

async function read(path) {
  return readFile(path, "utf8");
}

const [packageSource, lockSource, appVersionSource, releaseSource, acceptanceSource, roadmapSource, tourSource, tourHookSource, smokeSource, cleanupSource] = await Promise.all([
  read("package.json"),
  read("package-lock.json"),
  read("lib/app-version.ts"),
  read("docs/releases/1.0.0.md"),
  read("docs/audits/v1.0.0-acceptance.md"),
  read("docs/ROADMAP.md"),
  read("components/app/product-tour.tsx"),
  read("hooks/use-product-tour.ts"),
  read("scripts/release-browser-smoke.mjs"),
  read("scripts/remove-obsolete-routes.mjs"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const checks = [
  [pkg.version === VERSION, "package.json version must match v1.0.0 stable"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match v1.0.0 stable"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match v1.0.0 stable"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "stable promotion must not bump IndexedDB schema"],
  [releaseSource.includes("First stable release") && releaseSource.includes("schema 8") && releaseSource.includes("Manual Acceptance"), "stable release note must document the accepted promotion boundary"],
  [acceptanceSource.includes("PASS → آماده انتشار `v1.0.0` stable") && acceptanceSource.includes("Backup → Restore") && acceptanceSource.includes("old-tab") && acceptanceSource.includes("Desktop guide"), "stable acceptance record must retain automated and manual release evidence"],
  [roadmapSource.includes("v1.0.0 — First stable release ✅"), "roadmap must record the stable promotion"],
  [tourSource.includes('data-tour-overlay="masked"') && tourSource.includes('data-tour-target={targetName}') && tourSource.includes('mask={`url(#${MASK_ID})`}'), "stable must retain the accepted exact-target masked tour spotlight"],
  [tourHookSource.includes("ResizeObserver") && tourHookSource.includes("attempts < 18") && tourHookSource.includes("targetElement"), "stable must retain resilient tour target measurement"],
  [smokeSource.includes('width: 1280, height: 900') && smokeSource.includes('activeSpotlight') && smokeSource.includes('missing exact target, spotlight, or masked overlay'), "stable browser gate must retain deterministic tour diagnostics"],
  [cleanupSource.includes('"scripts/check-v1-rc.mjs"') && cleanupSource.includes('"tests/v1-rc.test.ts"'), "stable cleanup must remove RC-only gate files left by archive-over-checkout replacement"],
];

for (const [ok, message] of checks) {
  if (!ok) {
    console.error(`Stable readiness check failed: ${message}`);
    process.exit(1);
  }
}

console.log("v1.0.0 stable metadata gate passed. Full production release gate completed before stable acceptance.");
