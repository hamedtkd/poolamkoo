import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const css = await readFile(resolve(root, "app/globals.css"), "utf8");

const expectedCssImport = '@import "tailwindcss-animated/src/index.css";';
if (!css.includes(expectedCssImport)) {
  throw new Error(`globals.css must import tailwindcss-animated through its explicit CSS entry: ${expectedCssImport}`);
}
if (css.includes('@import "tailwindcss-animated";')) {
  throw new Error("Do not use the bare tailwindcss-animated CSS import; Turbopack dev can fail to resolve its package style field on Windows.");
}

for (const specifier of ["tailwindcss-animated/src/index.css", "motion/react"]) {
  try {
    require.resolve(specifier);
  } catch {
    throw new Error(`Animation dependency is not resolvable: ${specifier}. Run npm install before check/build.`);
  }
}

console.log("Animation dependencies resolve: explicit tailwindcss-animated CSS entry and motion/react are available.");
