import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import * as barrel from "../../src/index";

/**
 * The demo app is the only consumer that exercises the published barrel the way
 * a real app does, and a name it imports that the barrel does not export is a
 * runtime SyntaxError that no unit test would otherwise catch:
 *
 *   The requested module '/src/index.ts' does not provide an export named 'X'
 *
 * That exact failure shipped: DXUI-35 removed DanxScroll from the barrel to keep
 * @vueuse/core out of the peer-free surface, mainEntryPeerFree.test.ts asserted
 * it was gone — and App.vue kept importing it from the barrel, blanking the
 * whole demo. Nothing connected the two facts. This test does.
 */

const DEMO_ROOT = resolve(__dirname, "..");

/**
 * Files under `*-examples/` are loaded with `?raw` and evaluated by
 * useLivePreview against its own AVAILABLE_VALUES registry, so their import
 * statements are never resolved by the bundler. availableValuesSync.test.ts
 * covers that registry; this test covers real module imports only.
 */
function isRawExample(path: string): boolean {
  return path.includes("-examples");
}

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "__tests__") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, acc);
    } else if ((entry.endsWith(".vue") || entry.endsWith(".ts")) && !isRawExample(full)) {
      acc.push(full);
    }
  }
  return acc;
}

/** Import specifiers that resolve to the main barrel (see vite.config.ts alias). */
const BARREL_SPECIFIER = /^(danx-ui|(?:\.\.\/)+src)$/;

/** Named bindings of every `import { ... } from "<barrel>"` in a source file. */
function barrelImportNames(source: string): string[] {
  const names: string[] = [];
  const importRe = /import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  for (const [, clause, specifier] of source.matchAll(importRe)) {
    if (!BARREL_SPECIFIER.test(specifier)) continue;
    for (const binding of clause.split(",")) {
      // `Foo as Bar` imports Foo; `type Foo` is erased at runtime.
      const name = binding.trim().split(/\s+as\s+/)[0]?.trim();
      if (name && !name.startsWith("type ")) names.push(name);
    }
  }
  return names;
}

describe("demo imports resolve against the main barrel", () => {
  const files = collectSourceFiles(DEMO_ROOT);

  it("finds demo source files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("imports only names the barrel actually exports", () => {
    const exported = new Set(Object.keys(barrel));
    const missing: string[] = [];

    for (const file of files) {
      for (const name of barrelImportNames(readFileSync(file, "utf8"))) {
        if (!exported.has(name)) {
          missing.push(`${file.replace(`${DEMO_ROOT}/`, "demo/")} imports "${name}"`);
        }
      }
    }

    // A name here is either missing from src/index.ts, or deliberately excluded
    // from the barrel (peer-dependent) and must be imported from its subpath.
    expect(missing).toEqual([]);
  });
});
