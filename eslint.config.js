import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import vueParser from "vue-eslint-parser";

export default [
  eslint.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.ts", "**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        HTMLElement: "readonly",
        Event: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        FocusEvent: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        ResizeObserver: "readonly",
        MutationObserver: "readonly",
        IntersectionObserver: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      vue,
      prettier,
    },
    rules: {
      // Prettier integration
      "prettier/prettier": "error",

      // Vue 3 specific rules
      "vue/component-api-style": ["error", ["script-setup"]],
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineProps", "defineEmits", "defineModel", "defineSlots"],
        },
      ],
      "vue/no-export-in-script-setup": "error",
      "vue/prefer-define-options": "error",
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/custom-event-name-casing": ["error", "camelCase"],
      "vue/define-emits-declaration": ["error", "type-based"],
      "vue/define-props-declaration": ["error", "type-based"],
      "vue/no-unused-refs": "error",
      "vue/no-useless-v-bind": "error",
      "vue/prefer-true-attribute-shorthand": "error",
      "vue/require-typed-ref": "error",
      "vue/valid-define-options": "error",

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-unused-vars": "off", // Handled by TypeScript
      "no-undef": "off", // Handled by TypeScript
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts"],
  },
];
