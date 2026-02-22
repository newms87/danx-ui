# Demo Pages

## CRITICAL: Three Registration Points for New Demo Pages

New demo pages require updates in **three places**:

| File | What to Add |
|------|-------------|
| `demo/main.ts` | Route entry (`{ path, name, component }`) |
| `demo/App.vue` | Sidebar `<RouterLink>` in the Components or Utilities list |
| `demo/composables/useLivePreview.ts` | Component in `REGISTERED_COMPONENTS` and `AVAILABLE_VALUES` |

Missing any one of these causes the page to be unreachable or broken. The route alone does NOT add a sidebar link — the nav in `App.vue` is hardcoded.

## CRITICAL: Register New Exports in useLivePreview

The demo's live-editable code examples use `demo/composables/useLivePreview.ts` to compile and run `.vue?raw` strings at runtime. It does NOT use Vite's module resolution — imports are resolved from a flat registry called `AVAILABLE_VALUES`.

**Any new export from `src/index.ts` MUST also be added to `AVAILABLE_VALUES` in `useLivePreview.ts`**, otherwise demo examples that import it will fail with `ReferenceError: X is not defined`.

### What to Update

| Registry | Purpose |
|----------|---------|
| `AVAILABLE_VALUES` | Flat map of all importable names (functions, composables, constants) |
| `REGISTERED_COMPONENTS` | Components available in `<template>` without explicit import |

### When to Update

- Adding a new component → add to both `REGISTERED_COMPONENTS` and `AVAILABLE_VALUES`
- Adding a new composable/function → add to `AVAILABLE_VALUES`
- Adding a new constant/icon → add to `AVAILABLE_VALUES`

## Style Blocks Are Supported

`useLivePreview` extracts `<style>` blocks and injects them into the document head as global CSS. The `scoped` attribute is stripped since runtime-compiled components can't use Vue's scoping mechanism.

- Use `<style>` (not `<style scoped>`) in demo examples for clarity — scoped has no effect in live preview
- `:root` selectors work for defining CSS custom properties (e.g., variant tokens)
- Styles are cleaned up when the component unmounts or the code changes
- Each live preview instance gets a unique style element ID to avoid conflicts

## CRITICAL: No TypeScript in Demo Example Scripts

`useLivePreview` evaluates `<script>` blocks with `new Function()` — **plain JavaScript only**. TypeScript syntax (type annotations, generics, `as` casts) causes a silent syntax error: `buildSetup` returns `null`, template bindings become undefined, and the example breaks with no obvious error.

**Write demo example scripts in plain JS.** The `<script setup lang="ts">` tag is cosmetic — it is not compiled by Vite, it is eval'd as raw text.

```vue
<!-- WRONG — silent failure -->
function removeTag(index: number) {

<!-- CORRECT -->
function removeTag(index) {
```

### Validation

After adding demo pages, **always navigate to the demo page in a browser** (or at minimum verify that `useLivePreview.ts` has all needed entries). `yarn dev:check` only verifies the dev server starts — it does NOT catch runtime eval errors in live previews.
