import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { danxIconRawSvgPlugin } from "./scripts/vite-plugin-danx-icon-raw-svg";

const isDev = process.env.NODE_ENV !== "production";

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
        "components/button/index": resolve(__dirname, "src/components/button/index.ts"),
        "components/code-viewer/index": resolve(__dirname, "src/components/code-viewer/index.ts"),
        "components/dialog/index": resolve(__dirname, "src/components/dialog/index.ts"),
        "components/dialog/useDialog": resolve(__dirname, "src/components/dialog/useDialog.ts"),
        "components/scroll/index": resolve(__dirname, "src/components/scroll/index.ts"),
        "components/markdown-editor/index": resolve(
          __dirname,
          "src/components/markdown-editor/index.ts"
        ),
        "components/toggle/index": resolve(__dirname, "src/components/toggle/index.ts"),
        "components/range-slider/index": resolve(
          __dirname,
          "src/components/range-slider/index.ts"
        ),
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
