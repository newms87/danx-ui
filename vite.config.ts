import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { getComponentEntries } from "./scripts/component-entries.mjs";
import { danxIconRawSvgPlugin } from "./scripts/vite-plugin-danx-icon-raw-svg";

const isDev = process.env.NODE_ENV !== "production";

// DXUI-143: one lib entry per component that ships an index.ts, derived from
// the same src/components/* scan that generates package.json#exports — keeps
// dist output and the exports map from drifting apart.
const componentLibEntries = Object.fromEntries(
  getComponentEntries()
    .filter(({ hasIndex }) => hasIndex)
    .map(({ name, dir }) => [`components/${name}/index`, resolve(dir, "index.ts")])
);

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // DXUI-39: keep danx-icon's ?raw SVG imports under preserveModulesRoot so the
    // build doesn't emit a dist/node_modules/danx-icon directory
    danxIconRawSvgPlugin(),
    // Only generate types during build, not dev server
    ...(isDev
      ? []
      : [
          dts({
            include: ["src/**/*.ts", "src/**/*.vue"],
            outDir: "dist",
            staticImport: true,
            insertTypesEntry: true,
          }),
        ]),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      // Resolve bare "danx-ui" imports (used by demo/DemoPage) to source in dev
      ...(isDev ? { "danx-ui": resolve(__dirname, "src/index.ts") } : {}),
      // Use Vue full build (with runtime template compiler) in dev for live code editing
      ...(isDev ? { vue: "vue/dist/vue.esm-bundler.js" } : {}),
    },
  },
  // Dev server serves the demo app from index.html
  server: {
    port: 5777,
  },
  // Build produces library output only
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        ...componentLibEntries,
        // Hand-authored subpath: a public composable exported alongside (not
        // from) its component's index.ts — not derivable from directory
        // structure, so it isn't part of the generated component entries.
        "components/dialog/useDialog": resolve(__dirname, "src/components/dialog/useDialog.ts"),
        // DXUI-35: own entries so these peer-dependent modules (luxon / @vueuse/core)
        // are reachable only via their opt-in subpath, never via the main barrel.
        "shared/formatters/index": resolve(__dirname, "src/shared/formatters/index.ts"),
        "shared/actions": resolve(__dirname, "src/shared/actions.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "vue-router", "luxon", "@vueuse/core", "yaml"],
      output: {
        globals: {
          vue: "Vue",
        },
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "[name][extname]";
          }
          return "assets/[name][extname]";
        },
      },
    },
    cssCodeSplit: true,
    minify: false,
    sourcemap: true,
  },
});
