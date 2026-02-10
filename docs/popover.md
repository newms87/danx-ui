# Popover Component

A trigger-anchored floating panel that positions itself relative to a trigger element.

## Features

- **Trigger Slot** - Wraps an inline anchor element for automatic positioning
- **v-model Control** - Controlled visibility, removed from DOM when hidden
- **Placement** - Bottom, top, left, or right positioning relative to trigger
- **Auto-flip** - Automatically flips placement when panel would overflow the viewport
- **Click Outside** - Closes when clicking outside the trigger and panel
- **Escape Key** - Closes on Escape keypress
- **Teleport to Body** - Panel escapes overflow clipping and stacking contexts
- **CSS-only Animation** - Smooth fade + slide using `@starting-style`
- **Attrs Forwarding** - Class and style forwarded to panel, not trigger wrapper

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DanxPopover } from 'danx-ui';

const show = ref(false);
</script>

<template>
  <DanxPopover v-model="show">
    <template #trigger>
      <button @click="show = !show">Open</button>
    </template>
    <div style="padding: 1rem">
      Popover content here.
    </div>
  </DanxPopover>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Controls visibility via v-model |
| `placement` | `PopoverPlacement` | `"bottom"` | Panel placement relative to trigger |

### PopoverPlacement

`"top" | "bottom" | "left" | "right"`

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | v-model update when popover closes |

## Slots

| Slot | Description |
|------|-------------|
| `trigger` | Inline anchor element the panel positions against |
| `default` | Panel content |

## Placement

The `placement` prop controls where the panel appears relative to the trigger element. An 8px gap separates the trigger from the panel (configurable via `--popover-offset`).

```vue
<DanxPopover v-model="show" placement="top">
  <template #trigger><button @click="show = !show">Above</button></template>
  <div style="padding: 0.75rem">Content above the trigger.</div>
</DanxPopover>
```

### Auto-flip

When the panel would overflow the viewport in the preferred direction, it automatically flips to the opposite side. For example, a `placement="bottom"` popover near the bottom of the viewport will flip to appear above the trigger.

## Click-Outside Behavior

Clicking anywhere outside both the trigger and panel elements closes the popover. Clicks on the trigger or panel are ignored, allowing interaction with panel content and re-toggling via the trigger.

## Styling

### CSS Token Overrides

Override tokens on a wrapper class or directly on the popover:

```css
.my-popover {
  --popover-bg: #1a1a2e;
  --popover-border: #7c3aed;
  --popover-border-radius: 1rem;
}
```

```vue
<DanxPopover v-model="show" class="my-popover">
  ...
</DanxPopover>
```

Attrs (including `class`) are forwarded to the panel element, not the trigger wrapper.

### Available Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--popover-bg` | `--color-surface-elevated` | Background color |
| `--popover-border` | `--color-border` | Border color |
| `--popover-border-radius` | `0.5rem` | Corner radius |
| `--popover-shadow` | `rgb(0 0 0 / 0.5)` | Box shadow color |
| `--popover-text` | `--color-text` | Text color |
| `--popover-offset` | `0.5rem` | Gap between trigger and panel |
| `--popover-animation-duration` | `--duration-200` | Animation duration |
