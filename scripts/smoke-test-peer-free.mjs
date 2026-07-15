#!/usr/bin/env node
// DXUI-35: clean-install smoke test — asserts the built main entry
// (dist/index.js) never statically resolves the optional `@vueuse/core` /
// `luxon` peers, so a consumer who follows the README and skips installing
// them can still `import "danx-ui"` and use the peer-free surface.
//
// Rather than physically uninstalling the peers (this script has to run in
// the repo's own dev environment, where they're devDependencies), it walks
// the REAL static import graph reachable from dist/index.js — following only
// relative-path specifiers, exactly as a bundler/Node ESM resolver would —
// and fails if a bare `@vueuse/core` or `luxon` import is reachable. That is
// the actual condition that crashes a clean install: any reachable eager
// import of a peer that isn't there.

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndex = resolvePath(__dirname, "../dist/index.js");
const FORBIDDEN_BARE_SPECIFIERS = ["@vueuse/core", "luxon"];

if (!existsSync(distIndex)) {
  console.error(`smoke-test-peer-free: ${distIndex} does not exist — run "yarn build" first.`);
  process.exit(1);
}

const IMPORT_SPECIFIER_RE = /from\s+["']([^"']+)["']/g;

function resolveRelative(fromFile, specifier) {
  const base = dirname(fromFile);
  let candidate = resolvePath(base, specifier);
  if (existsSync(candidate)) return candidate;
  if (existsSync(candidate + ".js")) return candidate + ".js";
  const asIndex = resolvePath(candidate, "index.js");
  if (existsSync(asIndex)) return asIndex;
  throw new Error(`smoke-test-peer-free: could not resolve "${specifier}" from ${fromFile}`);
}

const visited = new Set();
const bareSpecifiersSeen = new Set();
const queue = [distIndex];

while (queue.length > 0) {
  const file = queue.pop();
  if (visited.has(file)) continue;
  visited.add(file);

  // Only walk JS module files — skip CSS/asset imports.
  if (!file.endsWith(".js")) continue;

  const source = readFileSync(file, "utf-8");
  for (const match of source.matchAll(IMPORT_SPECIFIER_RE)) {
    const specifier = match[1];
    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      queue.push(resolveRelative(file, specifier));
    } else {
      bareSpecifiersSeen.add(specifier);
    }
  }
}

const forbiddenFound = FORBIDDEN_BARE_SPECIFIERS.filter((spec) => bareSpecifiersSeen.has(spec));
if (forbiddenFound.length > 0) {
  console.error(
    `smoke-test-peer-free: dist/index.js eagerly (statically) resolves optional peer(s) ` +
      `[${forbiddenFound.join(", ")}] — a clean install without them would crash on ` +
      `"import 'danx-ui'". Move the offending re-export behind its own subpath entry.`
  );
  process.exit(1);
}

// Also prove the entry actually loads and exposes the peer-free surface —
// vue is a required peer and is present in this dev environment.
const mod = await import(distIndex);
if (typeof mod.DanxButton === "undefined" || typeof mod.DanxDialog === "undefined") {
  console.error(
    "smoke-test-peer-free: dist/index.js loaded but did not expose DanxButton/DanxDialog."
  );
  process.exit(1);
}

console.log(
  "smoke-test-peer-free: OK — dist/index.js never statically resolves @vueuse/core or luxon " +
    `(reachable bare specifiers: ${[...bareSpecifiersSeen].sort().join(", ")}).`
);
