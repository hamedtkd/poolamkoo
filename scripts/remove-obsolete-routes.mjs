import { access, rm } from "node:fs/promises";

const workspaceEntry = "app/(workspace)/dashboard/page.tsx";
const obsoleteRoutes = [
  "app/(app)",
  "app/page.tsx",
  "app/income",
  "app/investments",
  "app/funds",
  "app/reports",
  "app/settings",
  // v0.24 moved PWA discovery to public/app.webmanifest + workspace metadata.
  // Full-source replacement does not delete files that disappeared from newer ZIPs,
  // so old checkouts may still keep this Next.js special route and advertise the
  // installable manifest on the public Landing page.
  "app/manifest.ts",
  "app/manifest.js",
  "app/manifest.webmanifest",
];
const legacyLogoPath = ["public/logo-", "pool", "amco", ".svg"].join("");
const obsoleteSourcePaths = [
  legacyLogoPath,
  // v1.0 stable replaces the RC-only metadata gate. Extracting the stable source
  // over an existing RC checkout does not delete removed files, so clean them before
  // the test glob runs or stale RC assertions will incorrectly fail the stable gate.
  "scripts/check-v1-rc.mjs",
  "tests/v1-rc.test.ts",
];
const staleGeneratedTypePaths = [".next/types", ".next/dev/types"];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

let removedRoutes = 0;
if (await exists(workspaceEntry)) {
  for (const path of obsoleteRoutes) {
    if (!(await exists(path))) continue;
    await rm(path, { recursive: true, force: true });
    removedRoutes += 1;
    console.log(`Removed obsolete route: ${path}`);
  }
} else {
  console.log("Workspace route entry not found; obsolete-route cleanup skipped.");
}

let removedSourcePaths = 0;
for (const path of obsoleteSourcePaths) {
  if (!(await exists(path))) continue;
  await rm(path, { recursive: true, force: true });
  removedSourcePaths += 1;
  console.log(`Removed obsolete source file: ${path}`);
}

let removedGeneratedTypes = 0;
for (const path of staleGeneratedTypePaths) {
  if (!(await exists(path))) continue;
  await rm(path, { recursive: true, force: true });
  removedGeneratedTypes += 1;
  console.log(`Removed stale generated route types: ${path}`);
}

if (!removedRoutes && !removedSourcePaths && !removedGeneratedTypes) {
  console.log("No obsolete routes, source files, or stale generated route types found.");
}
