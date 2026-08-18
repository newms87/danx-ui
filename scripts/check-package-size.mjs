#!/usr/bin/env node
// DXUI-39: fails loud if the published npm tarball regresses — carries a
// dist/node_modules/ directory, ships .map files, or exceeds the size budget.
// The budgets themselves live in package-size-budget.mjs, shared with
// npmPackOutput.test.ts so the two enforcement points cannot drift apart.
import { execFileSync } from "child_process";
import { MAX_FILE_COUNT, MAX_UNPACKED_BYTES } from "./package-size-budget.mjs";

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf-8",
});
const [pkg] = JSON.parse(output);

const errors = [];

const nodeModulesEntries = pkg.files.filter((f) => f.path.includes("dist/node_modules/"));
if (nodeModulesEntries.length > 0) {
  errors.push(
    `Tarball contains ${nodeModulesEntries.length} dist/node_modules/ entr${nodeModulesEntries.length === 1 ? "y" : "ies"} (e.g. "${nodeModulesEntries[0].path}") — danx-icon's ?raw SVG imports must resolve under preserveModulesRoot ("src"), see scripts/vite-plugin-danx-icon-raw-svg.ts.`
  );
}

const mapEntries = pkg.files.filter((f) => f.path.endsWith(".map"));
if (mapEntries.length > 0) {
  errors.push(
    `Tarball contains ${mapEntries.length} sourcemap (.map) file(s) — check the "files" negation globs in package.json.`
  );
}

if (pkg.unpackedSize > MAX_UNPACKED_BYTES) {
  errors.push(
    `Unpacked size ${pkg.unpackedSize} bytes exceeds budget of ${MAX_UNPACKED_BYTES} bytes.`
  );
}

if (pkg.entryCount > MAX_FILE_COUNT) {
  errors.push(`Tarball contains ${pkg.entryCount} files, exceeding budget of ${MAX_FILE_COUNT}.`);
}

if (errors.length > 0) {
  console.error("npm package size check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}

console.log(
  `npm package size check passed: ${pkg.entryCount} files, ${pkg.unpackedSize} bytes unpacked.`
);
