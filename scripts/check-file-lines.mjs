import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const roots = ["app", "components", "hooks", "lib"];
const extensions = new Set([".ts", ".tsx"]);
const maxLines = 250;
const offenders = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if ([...extensions].some((ext) => entry.name.endsWith(ext))) {
      const lines = (await readFile(full, "utf8")).split(/\r?\n/).length;
      if (lines > maxLines) offenders.push(`${relative(process.cwd(), full)}: ${lines}`);
    }
  }
}

for (const root of roots) await walk(root);
if (offenders.length) {
  console.error(`Files over ${maxLines} lines:\n${offenders.join("\n")}`);
  process.exit(1);
}
console.log(`All TypeScript source files are <= ${maxLines} lines.`);
