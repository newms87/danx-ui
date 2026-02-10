import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/__tests__/**/*.test.ts", "demo/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,vue}"],
      exclude: [
        "src/**/__tests__/**",
        "src/**/types.ts",
        "src/**/*-types.ts",
        "src/vite-env.d.ts",
        "src/index.ts",
        "src/**/index.ts",
        "src/shared/markdown/escapeHtml.ts",
        "src/components/code-viewer/icons.ts",
        "src/components/button/icons.ts",
        "src/components/markdown-editor/mde-icons.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        // Vue SFC templates have V8 coverage limitations - template branches
        // are often reported as uncovered even when exercised by tests
        branches: 85,
        statements: 100,
      },
    },
  },
});
