# Getting Started

## Installation

```bash
npm install danx-ui
# or
yarn add danx-ui
# or
pnpm add danx-ui
```

## Requirements

- Vue 3.5.0 or higher
- Tailwind CSS v4 (optional, for custom utility classes)

## Basic Setup

### Import Everything

The simplest approach is to import the full library:

```typescript
// main.ts
import 'danx-ui/styles';
```

```vue
<script setup lang="ts">
import { DanxDialog } from 'danx-ui';
</script>
```

### Tree-Shaking (Recommended)

Import only what you need for smaller bundle sizes:

```typescript
// Import just the dialog component and its styles
import { DanxDialog } from 'danx-ui/components/dialog';
import 'danx-ui/components/dialog/styles';
```

### Composables Only

Use behavior without the component:

```typescript
import { useDialog } from 'danx-ui/components/dialog/useDialog';

const { isOpen, open, close, toggle } = useDialog();
```

## First Dialog

```vue
<template>
  <button @click="showDialog = true">Open Dialog</button>

  <DanxDialog
    v-model="showDialog"
    title="Welcome"
    close-button
  >
    <p>This is your first danx-ui dialog!</p>
  </DanxDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DanxDialog } from 'danx-ui';

const showDialog = ref(false);
</script>
```

## Without Styles

Components work without importing any CSS. They'll use browser defaults and inherit styles from your app:

```vue
<script setup lang="ts">
import { DanxDialog } from 'danx-ui';
// No style import - component still works
</script>
```

This is useful when you want to provide your own complete styling.

## Dark Mode

Dark mode is activated by adding the `.dark` class to your `<html>` or `<body>` element:

```html
<html class="dark">
  <!-- Dark mode active -->
</html>
```

Toggle it with JavaScript:

```typescript
document.documentElement.classList.toggle('dark');
```

## Troubleshooting

### Dialog not showing

Ensure v-model is bound to a reactive ref:

```typescript
// Correct
const showDialog = ref(false);

// Wrong - not reactive
let showDialog = false;
```

### Styles not applied

Make sure you've imported the styles:

```typescript
// Full library styles
import 'danx-ui/styles';

// Or component-specific styles
import 'danx-ui/components/dialog/styles';
```

### Dark mode not working

The `.dark` class must be on `<html>` or `<body>`:

```html
<html class="dark">
```

Not on a child element.

### TypeScript errors

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

## Next Steps

- [Theming Guide](./theming.md) - Customize colors, spacing, and component tokens
- [Dialog Component](./dialog.md) - Complete dialog API reference
