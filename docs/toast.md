# DanxToast

Toast notifications for transient messages. Auto-dismiss, deduplication with badge counts, 9-position screen anchoring, and variant styling.

## Setup

Mount `DanxToastContainer` once in your App.vue:

```vue
<script setup>
import { DanxToastContainer } from "danx-ui";
</script>

<template>
  <RouterView />
  <DanxToastContainer />
</template>
```

## Basic Usage

```vue
<script setup>
import { useToast, DanxButton } from "danx-ui";

const { toast } = useToast();
</script>

<template>
  <DanxButton @click="toast('File saved!')">Save</DanxButton>
</template>
```

## API

### `useToast()`

Singleton composable — all calls share the same state.

| Method | Signature | Description |
|--------|-----------|-------------|
| `toast` | `(msg, opts?) => id` | Add a toast |
| `success` | `(msg, opts?) => id` | Success variant |
| `danger` | `(msg, opts?) => id` | Danger variant |
| `warning` | `(msg, opts?) => id` | Warning variant |
| `info` | `(msg, opts?) => id` | Info variant |
| `dismiss` | `(id) => void` | Remove by ID |
| `dismissAll` | `() => void` | Clear all |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | `string` | required | Toast text |
| `variant` | `VariantType` | `""` | Visual variant |
| `position` | `ToastPosition` | `"bottom-right"` | Screen position |
| `duration` | `number` | `5000` | Auto-dismiss ms (0 = manual) |
| `dismissible` | `boolean` | `true` | Show close button |
| `target` | `HTMLElement` | — | Anchor to element |
| `targetPlacement` | `PopoverPlacement` | `"top"` | Placement vs target |

### Positions

9-position grid:

| | Left | Center | Right |
|---|---|---|---|
| **Top** | `top-left` | `top-center` | `top-right` |
| **Center** | `center-left` | `center-center` | `center-right` |
| **Bottom** | `bottom-left` | `bottom-center` | `bottom-right` |

## Features

### Auto-Dismiss

Toasts auto-dismiss after `duration` ms. Set `duration: 0` for persistent toasts. Hovering pauses the countdown.

### Deduplication

Calling `toast()` with the same message, variant, and position increments a badge count instead of creating duplicates.

### Variant Icons

Variants automatically show a default icon:

| Variant | Icon |
|---------|------|
| `success` | checkmark |
| `danger` | x-circle |
| `warning` | triangle |
| `info` | info circle |

## CSS Tokens

| Token | Default |
|-------|---------|
| `--dx-toast-bg` | `var(--color-surface-elevated)` |
| `--dx-toast-text` | `var(--color-text)` |
| `--dx-toast-border` | `var(--color-border)` |
| `--dx-toast-border-radius` | `var(--radius-component)` |
| `--dx-toast-shadow` | `var(--shadow-elevated)` |
| `--dx-toast-padding-x` | `var(--space-md)` |
| `--dx-toast-padding-y` | `var(--space-sm)` |
| `--dx-toast-max-width` | `24rem` |
| `--dx-toast-min-width` | `16rem` |
| `--dx-toast-gap` | `var(--space-sm)` |
| `--dx-toast-stack-gap` | `var(--space-sm)` |
| `--dx-toast-screen-offset` | `var(--space-lg)` |
| `--dx-toast-progress-height` | `3px` |
| `--dx-toast-progress-bg` | `var(--color-interactive)` |

Variant tokens are applied via the shared variant system (`--dx-variant-toast-{variant}-bg`, etc.).
