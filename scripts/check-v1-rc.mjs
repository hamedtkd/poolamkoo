import { readFile } from "node:fs/promises";

const VERSION = "1.0.0-rc.1";

async function read(path) {
  return readFile(path, "utf8");
}

const [packageSource, lockSource, appVersionSource, releaseSource, acceptanceSource, roadmapSource] = await Promise.all([
  read("package.json"),
  read("package-lock.json"),
  read("lib/app-version.ts"),
  read("docs/releases/1.0.0-rc.1.md"),
  read("docs/audits/v1-rc1-acceptance.md"),
  read("docs/ROADMAP.md"),
]);

const pkg = JSON.parse(packageSource);
const lock = JSON.parse(lockSource);
const checks = [
  [pkg.version === VERSION, "package.json version must match the release candidate"],
  [lock.version === VERSION && lock.packages?.[""]?.version === VERSION, "package-lock.json version must match the release candidate"],
  [appVersionSource.includes(`APP_VERSION = "${VERSION}"`), "runtime app version must match the release candidate"],
  [appVersionSource.includes("LOCAL_DATABASE_SCHEMA_VERSION = 8"), "release candidate must not bump IndexedDB schema"],
  [releaseSource.includes("Feature freeze") && releaseSource.includes("schema 8"), "release note must preserve the RC feature-freeze and schema boundary"],
  [acceptanceSource.includes("Chromium desktop") && acceptanceSource.includes("Backup → Restore") && acceptanceSource.includes("old-tab"), "RC acceptance doc must retain the manual release gates"],
  [roadmapSource.includes("v1.0.0-rc.1 — Release candidate validation"), "roadmap must identify the active release candidate"],
];

for (const [ok, message] of checks) {
  if (!ok) {
    console.error(`RC readiness check failed: ${message}`);
    process.exit(1);
  }
}

console.log("v1.0.0-rc.1 automated RC metadata gate passed. Manual RC acceptance checks are still required before v1.0.0 stable.");
