import { access, rm } from "node:fs/promises";

const routeGroupEntry = "app/(app)/page.tsx";
const obsoletePaths = [
  "app/page.tsx",
  "app/income",
  "app/investments",
  "app/funds",
  "app/reports",
  "app/settings",
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(routeGroupEntry))) {
  console.log("Route-group entry not found; obsolete-route cleanup skipped.");
  process.exit(0);
}

let removed = 0;
for (const path of obsoletePaths) {
  if (!(await exists(path))) continue;
  await rm(path, { recursive: true, force: true });
  removed += 1;
  console.log(`Removed obsolete route: ${path}`);
}

if (!removed) console.log("No obsolete pre-route-group entries found.");
