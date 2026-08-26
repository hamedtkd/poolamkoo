import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("obsolete cleanup removes legacy root manifest left by full-source replacement", () => {
  const root = mkdtempSync(join(tmpdir(), "poolamkoo-obsolete-cleanup-"));
  try {
    const workspace = join(root, "app", "(workspace)", "dashboard");
    const publicDir = join(root, "public");
    mkdirSync(workspace, { recursive: true });
    mkdirSync(publicDir, { recursive: true });
    mkdirSync(join(root, ".next", "types"), { recursive: true });
    writeFileSync(join(workspace, "page.tsx"), "export default function Page() { return null; }\n");
    writeFileSync(join(root, "app", "manifest.ts"), "export default function manifest() { return {}; }\n");
    writeFileSync(join(publicDir, "app.webmanifest"), '{"start_url":"/dashboard"}\n');
    writeFileSync(join(root, ".next", "types", "validator.ts"), "export {};\n");

    const result = spawnSync(process.execPath, [resolve("scripts/remove-obsolete-routes.mjs")], {
      cwd: root,
      encoding: "utf8",
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(join(root, "app", "manifest.ts")), false);
    assert.equal(existsSync(join(root, ".next", "types")), false);
    assert.equal(existsSync(join(publicDir, "app.webmanifest")), true);
    assert.match(result.stdout, /Removed obsolete route: app\/manifest\.ts/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
