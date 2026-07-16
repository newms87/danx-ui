// DXUI-143: single source of truth for the src/components/* -> package.json
// `exports` / vite lib-entry mapping, so the two never drift independently.
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const rootDir = join(__dirname, "..");
export const componentsDir = join(rootDir, "src/components");

export function kebabCase(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Every component directory that ships a public `index.ts` and/or a
 * `<kebab-name>.css` stylesheet, in deterministic (sorted) order.
 */
export function getComponentEntries() {
  return readdirSync(componentsDir)
    .filter((name) => statSync(join(componentsDir, name)).isDirectory())
    .sort()
    .map((name) => {
      const dir = join(componentsDir, name);
      const cssFile = `${kebabCase(name)}.css`;
      return {
        name,
        dir,
        hasIndex: existsSync(join(dir, "index.ts")),
        cssFile: existsSync(join(dir, cssFile)) ? cssFile : null,
      };
    })
    .filter((entry) => entry.hasIndex || entry.cssFile);
}
