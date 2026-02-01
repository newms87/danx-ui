# Vue 3 Patterns

## Composition API Only

**ALWAYS use `<script setup>` with Composition API. NEVER use Options API.**

```vue
<!-- CORRECT -->
<script setup lang="ts">
import { ref, computed } from "vue";

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<!-- WRONG - Options API -->
<script>
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    doubled() {
      return this.count * 2;
    },
  },
};
</script>
```

## `defineModel()` for Two-Way Binding

```typescript
// Simple model
const isOpen = defineModel<boolean>("isOpen", { required: true });

// Multiple models
const width = defineModel<number | string>("width", { default: 80 });
const height = defineModel<number | string>("height", { default: 80 });
```

### Model vs Props+Emit

```vue
<!-- CORRECT - Single source of truth -->
<script setup lang="ts">
const isOpen = defineModel<boolean>("isOpen", { required: true });
</script>

<!-- AVOID - Manual sync -->
<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ "update:isOpen": [value: boolean] }>();
</script>
```

## `v-if` vs `v-show`

### Always `v-if` for Dialogs

```vue
<!-- CORRECT - Clean DOM when closed -->
<template>
  <div v-if="isOpen" class="dialog">
    ...
  </div>
</template>

<!-- WRONG - DOM pollution, focus issues -->
<template>
  <div v-show="isOpen" class="dialog">
    ...
  </div>
</template>
```

### When to Use Each

| Directive | Use When |
|-----------|----------|
| `v-if` | Dialogs, modals, expensive components, conditional features |
| `v-show` | Frequent toggles of simple elements (tabs, tooltips) |

## Named Exports Only

```typescript
// CORRECT - Named exports
export { Dialog, DialogPanel, DialogOverlay };
export { useDialog } from "./useDialog";
export type { DialogProps } from "./types";

// WRONG - Default exports
export default Dialog;
```

### Why Named Exports

- Better tree-shaking
- Explicit imports
- IDE autocomplete works better
- Avoids naming conflicts

## TypeScript Strict Mode

### All Props Must Be Typed

```typescript
// CORRECT
defineProps<{
  isOpen: boolean;
  width?: number | string;
}>();

// WRONG - No types
defineProps(["isOpen", "width"]);
```

### Emit Types

```typescript
// CORRECT
const emit = defineEmits<{
  confirm: [];
  cancel: [];
  select: [item: Item];
}>();

// WRONG - No types
const emit = defineEmits(["confirm", "cancel", "select"]);
```

## Ref vs Reactive

### Prefer `ref()` Over `reactive()`

```typescript
// PREFERRED - Explicit .value, consistent API
const count = ref(0);
const user = ref<User | null>(null);

// AVOID - Loses reactivity on reassignment
const state = reactive({ count: 0 });
state = { count: 1 }; // Breaks reactivity!
```

### When to Use `reactive()`

Only for complex objects where `.value` adds significant noise:

```typescript
// Acceptable for form state
const form = reactive({
  name: "",
  email: "",
  errors: {} as Record<string, string>,
});
```

## Composable Patterns

### Return Object with Named Properties

```typescript
// CORRECT
export function useDialog() {
  const isOpen = ref(false);

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return { isOpen, open, close };
}

// WRONG - Array return
export function useDialog() {
  return [isOpen, open, close];
}
```

### Composables Are Functions

```typescript
// CORRECT - Function that creates state
export function useDialog() {
  const isOpen = ref(false);
  return { isOpen };
}

// WRONG - Singleton state
const isOpen = ref(false);
export function useDialog() {
  return { isOpen }; // Shared across all uses!
}
```

## Template Organization

### Script First, Then Template, Then Style

```vue
<script setup lang="ts">
// Script first - logic at top
</script>

<template>
  <!-- Template second - markup -->
</template>

<style scoped>
/* Style last - presentation */
</style>
```
