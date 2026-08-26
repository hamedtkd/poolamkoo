import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

const roots = ["app", "components", "hooks"];
const definitionPath = "node_modules/react-icons/ri/index.d.ts";

if (!existsSync(definitionPath)) {
  console.error("react-icons type definitions were not found. Run npm install before npm run check.");
  process.exit(1);
}

const definitions = await readFile(definitionPath, "utf8");
const exports = new Set([...definitions.matchAll(/export declare const (\w+):/g)].map((match) => match[1]));
const failures = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) await inspect(full);
  }
}

async function inspect(path) {
  const source = await readFile(path, "utf8");
  const imports = source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']react-icons\/ri["']/g);
  for (const match of imports) {
    for (const token of match[1].split(",")) {
      const imported = token.trim().split(/\s+as\s+/)[0]?.trim();
      if (imported && !exports.has(imported)) failures.push(`${relative(process.cwd(), path)}: ${imported}`);
    }
  }
}

for (const root of roots) await walk(root);

if (failures.length) {
  console.error(`Invalid react-icons/ri imports:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("All react-icons/ri named imports exist in the installed package.");
