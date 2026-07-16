import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * DXUI-87: `.claude/rules/demo-live-preview.md` requires every value export from
 * `src/index.ts` to also appear in `AVAILABLE_VALUES` in useLivePreview.ts, or a demo
 * example importing it fails at runtime with a ReferenceError. This test statically
 * diffs both export lists so a future addition to src/index.ts without a matching
 * AVAILABLE_VALUES entry fails CI instead of surfacing as a live demo crash.
 */

function extractIndexExportNames(source: string): string[] {
  const withoutTypeExports = source
    .replace(/export type \{[^}]*\}[^;]*;/gs, "")
    .replace(/export type \*[^;]*;/g, "")
    .replace(/export type [A-Za-z_$][\w$]* [^;]*;/g, "");

  const names = new Set<string>();
  for (const match of withoutTypeExports.matchAll(/export \{([^}]*)\}/gs)) {
    const withoutComments = match[1]!.replace(/\/\/.*$/gm, "");
    for (const part of withoutComments.split(",")) {
      const name = part
        .trim()
        .split(/\s+as\s+/)[0]!
        .trim();
      if (name) names.add(name);
    }
  }
  return [...names];
}

function extractNamesFromObjectLiteral(source: string, constName: string): string[] {
  const match = source.match(new RegExp(`const ${constName}[^{]*\\{([\\s\\S]*?)\\n\\};`));
  if (!match) throw new Error(`Could not locate ${constName} in useLivePreview.ts`);

  const names = new Set<string>();
  for (const line of match[1]!.split("\n")) {
    const trimmed = line.trim().replace(/,$/, "").replace(/:.*$/, "");
    if (!trimmed || trimmed.startsWith("//")) continue;
    names.add(trimmed);
  }
  return [...names];
}

/**
 * The "// Components" section of src/index.ts runs up to the "// Composables" comment,
 * but a handful of those export statements also pull in sibling utility/composable names
 * (e.g. the color-picker conversion helpers). Vue component names follow PascalCase, so
 * filtering to that convention excludes the camelCase/ALL_CAPS non-component exports.
 */
function extractComponentExportNames(source: string): string[] {
  const match = source.match(/\/\/ Components([\s\S]*?)\/\/ Composables/);
  if (!match) throw new Error("Could not locate the Components section in src/index.ts");
  return extractIndexExportNames(match[1]!).filter((name) => /^[A-Z][a-z]/.test(name));
}

describe("AVAILABLE_VALUES registry sync", () => {
  const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../");
  const indexSource = readFileSync(resolve(rootDir, "src/index.ts"), "utf8");
  const liveSource = readFileSync(resolve(rootDir, "demo/composables/useLivePreview.ts"), "utf8");

  it("contains every value export from src/index.ts", () => {
    const indexExports = extractIndexExportNames(indexSource);
    const availableValues = extractNamesFromObjectLiteral(liveSource, "AVAILABLE_VALUES");

    const missing = indexExports.filter((name) => !availableValues.includes(name));

    expect(missing).toEqual([]);
  });

  it("registers every exported component in REGISTERED_COMPONENTS", () => {
    const componentExports = extractComponentExportNames(indexSource);
    const registeredComponents = extractNamesFromObjectLiteral(liveSource, "REGISTERED_COMPONENTS");

    const missing = componentExports.filter((name) => !registeredComponents.includes(name));

    expect(missing).toEqual([]);
  });
});
