# Chip Component

A pill-shaped label component with semantic color types and optional icons.

## Features

- **Semantic Types** - 6 color types: blank (default), danger, success, warning, info, muted
- **Built-in Icons** - Same icon system as DanxButton (e.g. `icon="confirm"`)
- **Six Sizes** - xxs, xs, sm, md, lg, xl
- **Removable** - Optional X button that emits `remove` event
- **Native Click Passthrough** - No click prevention; clicks pass through natively
- **CSS Tokens** - Full customization via component tokens
- **Zero Dependencies** - Inline SVG icons, no external icon library

## Basic Usage

```vue
<template>
  <DanxChip type="success" icon="confirm">Approved</DanxChip>
</template>

<script setup lang="ts">
import { DanxChip } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `ChipType` | `""` | Semantic color type |
| `size` | `ChipSize` | `"md"` | Chip size |
| `icon` | `Component \| string` | - | Icon name, raw SVG string, or component |
| `label` | `string` | - | Text label (alternative to slot) |
| `removable` | `boolean` | `false` | Shows remove (X) button |
| `tooltip` | `string` | - | Native title attribute |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `remove` | - | Fired when remove button is clicked |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Chip text content |
| `icon` | Override icon rendering |

## Sizes

All six sizes are available: `xxs`, `xs`, `sm`, `md` (default), `lg`, `xl`.

```vue
<DanxChip size="xs">Small</DanxChip>
<DanxChip size="md">Medium</DanxChip>
<DanxChip size="lg">Large</DanxChip>
```

## Types

Six semantic color types control the chip's background and text color:

```vue
<DanxChip>Default</DanxChip>
<DanxChip type="danger">Error</DanxChip>
<DanxChip type="success">Complete</DanxChip>
<DanxChip type="warning">Pending</DanxChip>
<DanxChip type="info">Draft</DanxChip>
<DanxChip type="muted">Archived</DanxChip>
```

## Icons

Icons work the same way as DanxButton — by name, raw SVG string, or Vue component:

```vue
<!-- By name -->
<DanxChip icon="confirm">Approved</DanxChip>

<!-- By slot -->
<DanxChip>
  <template #icon><MyCustomIcon /></template>
  Custom
</DanxChip>
```

## Removable

Add the `removable` prop to show an X button. Listen for the `remove` event:

```vue
<DanxChip removable @remove="handleRemove">Tag</DanxChip>
```

The remove button click does not propagate to the chip itself, so you can safely combine removable chips with click handlers.

## Styling with CSS Tokens

### Global Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-chip-font-family` | `--font-sans` | Font family |
| `--dx-chip-border-radius` | `9999px` | Corner radius (pill) |
| `--dx-chip-transition` | `--transition-fast` | Transition timing |
| `--dx-chip-bg` | `--color-surface-sunken` | Default background |
| `--dx-chip-text` | `--color-text` | Default text color |

### Size Tokens

Per size (`xxs`, `xs`, `sm`, `md`, `lg`, `xl`):

| Token | Description |
|-------|-------------|
| `--dx-chip-{size}-padding-x` | Horizontal padding |
| `--dx-chip-{size}-padding-y` | Vertical padding |
| `--dx-chip-{size}-icon-size` | Icon dimensions |
| `--dx-chip-{size}-font-size` | Font size |
| `--dx-chip-{size}-gap` | Icon-text gap |

### Type Tokens

Per type (`danger`, `success`, `warning`, `info`, `muted`):

| Token | Description |
|-------|-------------|
| `--dx-chip-{type}-bg` | Background color |
| `--dx-chip-{type}-text` | Text/icon color |

### Remove Button Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-chip-remove-size` | `1em` | Remove icon size |
| `--dx-chip-remove-hover-bg` | `rgb(0 0 0 / 0.1)` | Hover background |

### Example Override

```css
.my-chip {
  --dx-chip-bg: oklch(0.9 0.1 200);
  --dx-chip-border-radius: 0.5rem;
}
```

## Custom Types

Use `customType` to define app-specific semantic types beyond the built-in set. When set, it generates the same BEM modifier class as `type` (e.g., `customType="restart"` produces `.danx-chip--restart`).

```vue
<DanxChip customType="restart">Restarting</DanxChip>
```

Define the matching CSS tokens in your app:

```css
.danx-chip--restart {
  --dx-chip-restart-bg: oklch(0.85 0.1 50);
  --dx-chip-restart-text: oklch(0.3 0.1 50);

  background: var(--dx-chip-restart-bg);
  color: var(--dx-chip-restart-text);
}
```

When both `type` and `customType` are set, `customType` takes precedence.

## Accessibility

- Chips use `<span>` elements (not buttons) since they are labels, not controls
- The remove button has `role="button"` and `tabindex="0"` for keyboard access
- The remove button responds to both click and Enter key
- Use the `tooltip` prop for additional context via native `title` attribute
