#!/usr/bin/env node
// DXUI-39: fails loud if the published npm tarball regresses — carries a
// dist/node_modules/ directory, ships .map files, or exceeds the size budget
// calibrated against the current danx-icon-only (no-yaml) baseline.
import { execFileSync } from "child_process";

const MAX_UNPACKED_BYTES = 1.8 * 1024 * 1024; // ~1.2MB observed baseline + headroom
const MAX_FILE_COUNT = 1150; // ~1130 observed baseline (DXUI-170) + headroom

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
