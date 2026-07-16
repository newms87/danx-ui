#!/usr/bin/env node
// DXUI-143: derives the `./components/<name>` and `./components/<name>/styles`
// entries of package.json#exports from src/components/*, so the map can't
// drift as components are added/removed. Run standalone to regenerate, or
// with --check to fail (CI-friendly) when the committed map is stale.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getComponentEntries, rootDir } from "./component-entries.mjs";

const pkgPath = join(rootDir, "package.json");

// Anything under ./components/* that isn't a plain `<name>` or `<name>/styles`
// entry (e.g. `./components/dialog/useDialog`, a hand-authored composable
// subpath) isn't derivable from directory structure — leave it untouched.
const GENERATED_KEY_RE = /^\.\/components\/[^/]+(\/styles)?$/;

function buildGeneratedExports() {
  const entries = {};
  for (const { name, hasIndex, cssFile } of getComponentEntries()) {
    if (hasIndex) {
      entries[`./components/${name}`] = {
        types: `./dist/components/${name}/index.d.ts`,
        import: `./dist/components/${name}/index.js`,
      };
    }
    if (cssFile) {
      entries[`./components/${name}/styles`] = `./dist/components/${name}/${cssFile}`;
    }
  }
  return entries;
}

function main() {
  const check = process.argv.includes("--check");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  const currentExports = pkg.exports ?? {};

  const preserved = Object.fromEntries(
    Object.entries(currentExports).filter(([key]) => !GENERATED_KEY_RE.test(key))
  );
  const nextExports = { ...preserved, ...buildGeneratedExports() };

  const changed = JSON.stringify(currentExports) !== JSON.stringify(nextExports);

  if (check) {
    if (changed) {
      console.error(
        "package.json `exports` map is stale relative to src/components/*.\n" +
          'Run "npm run generate:exports" and commit the result.'
      );
      process.exit(1);
    }
    console.log("package.json exports map is up to date.");
    return;
  }

  if (!changed) {
    console.log("package.json exports map already up to date.");
    return;
  }

  pkg.exports = nextExports;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(
    `Updated package.json exports map (${Object.keys(nextExports).length} entries, ` +
      `${Object.keys(preserved).length} preserved).`
  );
}

main();
