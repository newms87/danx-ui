import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
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
        "components/code-viewer/index": resolve(__dirname, "src/components/code-viewer/index.ts"),
        "components/dialog/index": resolve(__dirname, "src/components/dialog/index.ts"),
        "components/dialog/useDialog": resolve(__dirname, "src/components/dialog/useDialog.ts"),
        "components/markdown-editor/index": resolve(__dirname, "src/components/markdown-editor/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "vue-router"],
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
