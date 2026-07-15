import { readFileSync } from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";

const RAW_SVG_SUFFIX = ".svg?raw";
const SPECIFIER_PREFIX = "danx-icon/";

/**
 * DXUI-39: danx-icon's `?raw` SVG imports resolve to a node_modules path, which
 * falls outside `build.rollupOptions.output.preserveModulesRoot` ("src"). Rollup
 * then mirrors the original absolute path in the output, producing a stray
 * `dist/node_modules/danx-icon/` directory instead of an inlined string literal.
 *
 * This plugin resolves those specifiers to a virtual module id anchored under
 * `src/`, so preserveModules mirrors them alongside the rest of the library
 * output and no `dist/node_modules` directory is emitted.
 */
export function danxIconRawSvgPlugin(): Plugin {
  const virtualRoot = resolve(__dirname, "..", "src", "__danx-icon-svg__");
  const realPathByVirtualId = new Map<string, string>();

  return {
    name: "danx-icon-raw-svg",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.startsWith(SPECIFIER_PREFIX) || !source.endsWith(RAW_SVG_SUFFIX)) {
        return null;
      }

      const realSpecifier = source.slice(0, -"?raw".length);
      const resolved = await this.resolve(realSpecifier, importer, { skipSelf: true });
      if (!resolved) {
        return null;
      }

      const relativePath = source.slice(SPECIFIER_PREFIX.length, -"?raw".length);
      const virtualId = resolve(virtualRoot, relativePath);
      realPathByVirtualId.set(virtualId, resolved.id);
      return virtualId;
    },
    load(id) {
      const realPath = realPathByVirtualId.get(id);
      if (!realPath) {
        return null;
      }

      const content = readFileSync(realPath, "utf-8");
      return `export default ${JSON.stringify(content)};`;
    },
  };
}
