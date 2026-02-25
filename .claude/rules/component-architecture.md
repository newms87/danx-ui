# Component Architecture

## File Organization

Components use feature-based organization:

```
src/components/{component}/
├── Component.vue      # Main component
├── useComponent.ts    # Composable logic
├── component.css      # Component-specific CSS tokens
├── types.ts           # TypeScript interfaces (excluded from coverage by name)
├── index.ts           # Named exports
└── __tests__/         # Component tests
    ├── Component.test.ts
    └── useComponent.test.ts
```

## Type Declaration Rules

**Project type files use `.ts`. Reserve `.d.ts` for ambient declarations only.**

| File contains | Extension | Example |
|---------------|-----------|---------|
| Only types/interfaces | `.ts` | `types.ts`, `action-types.ts` |
| Runtime code + derived types | `.ts` | `icons.ts` (exports `IconName = keyof typeof obj`) |
| Ambient declarations (module augmentations, Vite env) | `.d.ts` | `vite-env.d.ts` |
| Component logic | `.vue` | Import types from `.ts` files |

### Where types live

- **Standalone type declarations** (interfaces, type aliases, union types) go in `types.ts` or `*-types.ts` files
- **Types derived from runtime values** (e.g. `keyof typeof`) stay in the `.ts` file alongside the values they derive from
- **Vue components** import types from `.ts` files — never define prop/emit interfaces inline
- **Ambient declarations** (e.g. `declare module "*.vue"`) use `.d.ts` since they have no runtime equivalent

### Why `.ts` (not `.d.ts`)

- `.d.ts` exists to declare types for things without TypeScript source (JS libs, global augmentations)
- Using `.d.ts` for regular project types is misleading about their purpose
- Coverage exclusion is handled by naming convention (`types.ts`, `*-types.ts`) in vitest.config.ts
- TypeScript resolves `import from "./types"` identically for both extensions

## Documentation Requirements

Every `.vue` file MUST have a comprehensive comment block at the top of the script section:

```vue
<script setup lang="ts">
/**
 * DialogOverlay - Background overlay for modal dialogs
 *
 * Provides a semi-transparent backdrop that:
 * - Blocks interaction with content behind the dialog
 * - Closes the dialog when clicked (optional via closeOnOverlayClick)
 * - Supports custom opacity via CSS tokens
 *
 * @props
 *   isOpen: boolean - Controls visibility state (use v-model)
 *   closeOnOverlayClick?: boolean - Whether clicking overlay closes dialog (default: true)
 *
 * @emits
 *   update:isOpen - Emitted when overlay is clicked to close
 *
 * @slots
 *   default - Dialog content positioned above overlay
 *
 * @tokens
 *   --dx-dialog-overlay-bg - Background color (default: rgb(0 0 0 / 0.5))
 *   --dx-dialog-overlay-z - Z-index (default: 40)
 *
 * @example
 *   <DialogOverlay v-model:isOpen="showDialog">
 *     <DialogPanel>...</DialogPanel>
 *   </DialogOverlay>
 */
</script>
```

## State Management Rules

### Use `defineModel()` for Two-Way Binding

```typescript
// CORRECT - Declarative, simple
const isOpen = defineModel<boolean>("isOpen", { required: true });

// WRONG - Never use defineExpose for imperative methods
defineExpose({ open, close }); // FORBIDDEN
```

### Why No `defineExpose`

- Creates hidden API surface
- Makes testing harder
- Breaks reactivity patterns
- Parents must use refs instead of props

## Event Handling

### Prefer v-model Over Events

```vue
<!-- CORRECT -->
<Dialog v-model:isOpen="showDialog" />

<!-- AVOID when v-model is possible -->
<Dialog :isOpen="showDialog" @close="showDialog = false" />
```

### Named Events for Actions

```typescript
const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
```

## Slot Patterns

### Always Provide Default Slots

```vue
<template>
  <div class="dialog-panel">
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </div>
</template>
```

### Document All Slots

Every slot must be documented in the component's comment block.

## CSS Token Patterns

### Never Use Styling Props

```vue
<!-- WRONG -->
<Dialog :bg-color="'blue'" :padding="'lg'" />

<!-- CORRECT - Use CSS tokens -->
<Dialog class="my-dialog" />

<style>
.my-dialog {
  --dx-dialog-bg: blue;
  --dx-dialog-padding: 2rem;
}
</style>
```

### Token Naming Convention

```css
--dx-{component}-{property}
--dx-dialog-bg
--dx-dialog-padding
--dx-dialog-border-radius
```

## Variant Pattern

Components that support color variants (danger, success, warning, info, muted) MUST use the shared variant system. Never create component-specific variant types or CSS class-based variant styling.

### Implementation checklist

1. Import `VariantType` from `../../shared/types` in the component's `types.ts`
2. Add `variant?: VariantType` prop (default `""`)
3. Use the `useVariant` composable to map component tokens to variant tokens
4. Apply the returned style object to the component's root/panel element via `:style`

### useVariant composable

Located at `src/shared/composables/useVariant.ts`. Maps component CSS tokens to shared variant tokens via inline styles. The token fallback chain is: `--dx-variant-{component}-{variant}-{suffix}` then `--dx-variant-{variant}-{suffix}`.

| What to do | How |
|------------|-----|
| Type the prop | `variant?: VariantType` (from `shared/types`) |
| Create mapping | `useVariant(computed(() => props.variant), "component-name", { "--dx-comp-bg": "bg", "--dx-comp-text": "text" })` |
| Apply styles | `:style="variantStyle"` on the styled element |

### What NOT to do

| Wrong | Why |
|-------|-----|
| Custom variant type (`PopoverVariant`) | Duplicates `VariantType` |
| CSS class modifiers (`.danx-popover--danger`) | Bypasses token system |
| Hardcoded token overrides per variant | Not reusable across themes |

## Forbidden Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| Options API | Outdated | Use Composition API with `<script setup>` |
| `defineExpose` | Imperative | Use `defineModel` for state |
| Default exports | Tree-shaking | Named exports only |
| Styling props | Inflexible | CSS tokens |
| `v-show` for dialogs | DOM pollution | Use `v-if` for mounting |
| `any` type | Type safety | Proper TypeScript types |
| `types.d.ts` for project types | Misleading — `.d.ts` is for ambient declarations | Use `types.ts` |
