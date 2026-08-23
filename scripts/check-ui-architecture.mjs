import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const roots = ["app", "components", "hooks", "lib"];
const files = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.tsx?$/.test(entry.name)) files.push(full);
  }
}
for (const root of roots) await walk(root);

const violations = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  const name = relative(process.cwd(), file);
  if (/<select\b/.test(source)) violations.push(`${name}: raw <select> is forbidden`);
  if (/type\s*=\s*["']date["']/i.test(source)) violations.push(`${name}: native date input is forbidden`);
  if (/<PriceInput\b/.test(source) && name !== "components/ui/money-input.tsx") {
    violations.push(`${name}: compose prices through MoneyInput/InputGroup`);
  }
  if (/<Table\b/.test(source) && !["components/data-table.tsx", "components/ui/table.tsx"].includes(name)) {
    violations.push(`${name}: business tables must use DataTable`);
  }
}

if (violations.length) {
  console.error(`UI architecture violations:\n${violations.join("\n")}`);
  process.exit(1);
}
console.log("UI architecture checks passed: no raw select/date inputs; money fields and tables use shared components.");
