# Demo Live Preview

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

### Validation

After adding demo pages, **always navigate to the demo page in a browser** (or at minimum verify that `useLivePreview.ts` has all needed entries). `yarn dev:check` only verifies the dev server starts — it does NOT catch runtime eval errors in live previews.
