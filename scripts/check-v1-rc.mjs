import { readFile } from "node:fs/promises";

const VERSION = "1.0.0-rc.2";

async function read(path) {
  return readFile(path, "utf8");
}

const [packageSource, lockSource, appVersionSource, releaseSource, acceptanceSource, roadmapSource, tourSource] = await Promise.all([
  read("package.json"),
  read("package-lock.json"),
  read("lib/app-version.ts"),
  read("docs/releases/1.0.0-rc.2.md"),
  read("docs/audits/v1-rc2-acceptance.md"),
  read("docs/ROADMAP.md"),
  read("components/app/product-tour.tsx"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const checks = [
  [pkg.version === VERSION, "package.json version must match the release candidate"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match the release candidate"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match the release candidate"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "release candidate must not bump IndexedDB schema"],
  [releaseSource.includes("Feature freeze") && releaseSource.includes("schema 8") && releaseSource.includes("Spotlight"), "release note must preserve the RC boundary and document the guide blocker fix"],
  [acceptanceSource.includes("Chromium desktop") && acceptanceSource.includes("Backup → Restore") && acceptanceSource.includes("old-tab") && acceptanceSource.includes("راهنمای سریع"), "RC acceptance doc must retain the manual release gates and guide recheck"],
  [roadmapSource.includes("v1.0.0-rc.2 — Product tour release-blocker fix"), "roadmap must identify the active release candidate"],
  [tourSource.includes('data-tour-spotlight="true"') && tourSource.includes('data-tour-shade="top"'), "RC2 must ship the transparent product-tour spotlight"],
];

for (const [ok, message] of checks) {
  if (!ok) {
    console.error(`RC readiness check failed: ${message}`);
    process.exit(1);
  }
}

console.log("v1.0.0-rc.2 automated RC metadata gate passed. Manual RC acceptance checks are still required before v1.0.0 stable.");
