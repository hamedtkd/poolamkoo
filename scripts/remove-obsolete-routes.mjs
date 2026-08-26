import { access, rm } from "node:fs/promises";

const workspaceEntry = "app/(workspace)/dashboard/page.tsx";
const obsoletePaths = [
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
  for (const path of obsoletePaths) {
    if (!(await exists(path))) continue;
    await rm(path, { recursive: true, force: true });
    removedRoutes += 1;
    console.log(`Removed obsolete route: ${path}`);
  }
} else {
  console.log("Workspace route entry not found; obsolete-route cleanup skipped.");
}

let removedGeneratedTypes = 0;
for (const path of staleGeneratedTypePaths) {
  if (!(await exists(path))) continue;
  await rm(path, { recursive: true, force: true });
  removedGeneratedTypes += 1;
  console.log(`Removed stale generated route types: ${path}`);
}

if (!removedRoutes && !removedGeneratedTypes) {
  console.log("No obsolete routes or stale generated route types found.");
}
