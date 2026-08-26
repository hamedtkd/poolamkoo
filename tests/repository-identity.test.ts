import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import test from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { name: string; version: string };

function textFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...textFiles(path));
    else if ([".ts", ".tsx", ".js", ".mjs", ".md", ".json", ".yml", ".yaml", ".svg"].includes(extname(path))) files.push(path);
  }
  return files;
}

test("canonical repository identity is Poolamkoo", () => {
  assert.equal(packageJson.name, "poolamkoo");
  assert.equal(packageJson.version, "0.25.0");
  assert.match(readFileSync("lib/app-version.ts", "utf8"), /APP_VERSION = "0\.25\.0"/);
  assert.match(readFileSync("lib/community.ts", "utf8"), /github\.com\/hamedtkd\/poolamkoo/);
  assert.ok(existsSync("public/logo-poolamkoo.svg"));
});

test("active repository text does not use the previous Latin spelling", () => {
  const wrongLower = ["pool", "amco"].join("");
  const wrongTitle = ["Pool", "amco"].join("");
  const typo = ["pol", "amco"].join("");
  const roots = ["app", "components", "hooks", "lib", "public", "scripts", "docs", "tests", ".github"];
  const offenders = roots.flatMap(textFiles).filter((path) => {
    const source = readFileSync(path, "utf8");
    return source.includes(wrongLower) || source.includes(wrongTitle) || source.includes(typo);
  });
  assert.deepEqual(offenders, []);
});
