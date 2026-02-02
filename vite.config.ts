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
        "components/dialog/index": resolve(__dirname, "src/components/dialog/index.ts"),
        "components/dialog/useDialog": resolve(__dirname, "src/components/dialog/useDialog.ts"),
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
