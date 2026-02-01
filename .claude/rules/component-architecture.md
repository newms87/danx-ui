# Component Architecture

## File Organization

Components use feature-based organization:

```
src/components/{component}/
├── Component.vue      # Main component
├── useComponent.ts    # Composable logic
├── component.css      # Component-specific CSS tokens
├── types.ts           # TypeScript interfaces
├── index.ts           # Named exports
└── __tests__/         # Component tests
    ├── Component.test.ts
    └── useComponent.test.ts
```

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
 *   --dialog-overlay-bg - Background color (default: rgb(0 0 0 / 0.5))
 *   --dialog-overlay-z - Z-index (default: 40)
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
  --dialog-bg: blue;
  --dialog-padding: 2rem;
}
</style>
```

### Token Naming Convention

```css
--{component}-{property}
--dialog-bg
--dialog-padding
--dialog-border-radius
```

## Forbidden Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| Options API | Outdated | Use Composition API with `<script setup>` |
| `defineExpose` | Imperative | Use `defineModel` for state |
| Default exports | Tree-shaking | Named exports only |
| Styling props | Inflexible | CSS tokens |
| `v-show` for dialogs | DOM pollution | Use `v-if` for mounting |
| `any` type | Type safety | Proper TypeScript types |
