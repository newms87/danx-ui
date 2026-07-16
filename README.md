# danx-ui

[![npm version](https://img.shields.io/npm/v/danx-ui.svg)](https://www.npmjs.com/package/danx-ui)
[![license](https://img.shields.io/npm/l/danx-ui.svg)](https://github.com/newms87/danx-ui/blob/main/LICENSE)

Zero-dependency Vue 3 + Tailwind CSS v4 component library with three-tier theming.

## Features

- **Zero Runtime Dependencies** - Vue 3 is the only required peer dependency; `@vueuse/core`, `luxon`, and `yaml` are optional peers needed only if you use the features that depend on them
- **Tree-Shakeable** - Import only what you need
- **Three-Tier Theming** - Primitive → Semantic → Component token system
- **Dark Mode Built-in** - Just add `.dark` class
- **100% Declarative** - v-model controlled, no imperative APIs
- **Native Elements** - Uses `<dialog>` for accessibility
- **Styles Optional** - Components work without CSS imports

## Installation

```bash
npm install danx-ui
# or
yarn add danx-ui
# or
pnpm add danx-ui
```

## Quick Start

### Import Everything

```typescript
import { DanxDialog, useDialog } from 'danx-ui';
import 'danx-ui/styles';
```

### Import Just What You Need

```typescript
// Just the dialog component
import { DanxDialog } from 'danx-ui/components/dialog';
import 'danx-ui/components/dialog/styles';

// Just the composable (no component)
import { useDialog } from 'danx-ui/components/dialog/useDialog';

// Just the tokens (for custom themes)
import 'danx-ui/shared/tokens';
```

## Optional Peer Dependencies

Only Vue 3 is required. `@vueuse/core`, `luxon`, and `yaml` are optional peers — install them only if you use the entry points below. The main `danx-ui` entry never imports any of the three, so `import 'danx-ui'` and its peer-free surface (e.g. `DanxButton`, `DanxDialog`, `DanxScroll`/`DanxVirtualScroll` used without `infiniteScroll`) work with just Vue installed.

| Peer | Needed by |
|---|---|
| `@vueuse/core` | `danx-ui/actions` (`useActions`, `withDefaultActions`, `activeActionVnode`); `danx-ui/components/scroll`'s `useScrollInfinite` — and, transitively, `DanxScroll`/`DanxVirtualScroll` only when their `infiniteScroll` prop is set to `true` (lazy-loaded on demand) |
| `luxon` | `danx-ui/formatters` (the DateTime parsing/timezone/formatting functions and the re-exported Luxon `DateTime`) |
| `yaml` | `danx-ui/components/code-viewer` (YAML formatting) and structured-data detection (`isJSON`/`isStructuredData`) |

```typescript
// Requires @vueuse/core
import { useActions } from 'danx-ui/actions';

// Requires luxon
import { fDateTime, parseDateTime } from 'danx-ui/formatters';
```

## Usage

### Basic Dialog

```vue
<template>
  <button @click="showDialog = true">Open Dialog</button>

  <DanxDialog
    v-model="showDialog"
    title="Hello World"
    close-button
  >
    <p>Dialog content goes here.</p>
  </DanxDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DanxDialog } from 'danx-ui';

const showDialog = ref(false);
</script>
```

### Confirm Dialog

```vue
<DanxDialog
  v-model="showConfirm"
  title="Confirm Action"
  close-button="Cancel"
  confirm-button="Delete"
  :is-saving="isDeleting"
  @confirm="handleDelete"
>
  <p>Are you sure you want to delete this item?</p>
</DanxDialog>
```

### Custom Sizing

```vue
<!-- 80vw × 60vh -->
<DanxDialog v-model="show" :width="80" :height="60" />

<!-- Fixed size -->
<DanxDialog v-model="show" width="400px" height="300px" />

<!-- Full screen -->
<DanxDialog v-model="show" :width="100" :height="100" />
```

## Theming

danx-ui uses a three-tier CSS token system:

1. **Primitives** - Raw color palette, spacing, etc.
2. **Semantics** - Contextual meaning (surface, text, interactive)
3. **Component** - Per-component tokens

### Customization Levels

**Tweak a component:**
```css
.my-dialog {
  --dialog-bg: #f0f0f0;
}
```

**Change system-wide behavior:**
```css
:root {
  --color-surface: #fafafa;
  --color-interactive: #0066cc;
}
```

**Dark mode:**
```css
/* Built-in - just add .dark class to html or body */
<html class="dark">
```

See [Theming Guide](./docs/theming.md) for details.

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Theming](./docs/theming.md)
- [Dialog Component](./docs/dialog.md)
- [Select Component](./docs/select.md)
- [Input Component](./docs/input.md)
- [Textarea Component](./docs/textarea.md)
- [Field Wrapper Component](./docs/field-wrapper.md)

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

Requires native `<dialog>` element support.

## Contributing

Contributions are welcome! Please read:

- [Contributing Guide](./docs/contributing.md) - Development setup and PR process
- [CLAUDE.md](./CLAUDE.md) - Detailed development rules and patterns

## License

[MIT](./LICENSE)
