# Popover Component

A trigger-anchored floating panel that positions itself relative to a trigger element.

## Features

- **Trigger Slot** - Wraps an inline anchor element for automatic positioning
- **Explicit Position** - Optional `{ x, y }` coordinates for cursor-positioned panels (e.g. context menus)
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
| `position` | `PopoverPosition` | - | Explicit `{ x, y }` viewport coordinates |

### PopoverPlacement

`"top" | "bottom" | "left" | "right"`

### PopoverPosition

`{ x: number; y: number }` - Viewport pixel coordinates for the panel's top-left corner.

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

## Explicit Position

The `position` prop places the panel at arbitrary viewport coordinates instead of anchoring to the trigger element. This is useful for context menus or cursor-follow patterns. The trigger slot still controls click-outside detection.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DanxPopover } from 'danx-ui';

const show = ref(false);
const position = ref({ x: 0, y: 0 });

function onContextMenu(event: MouseEvent) {
  event.preventDefault();
  position.value = { x: event.clientX, y: event.clientY };
  show.value = true;
}
</script>

<template>
  <DanxPopover v-model="show" :position="position">
    <template #trigger>
      <div @contextmenu="onContextMenu">Right-click me</div>
    </template>
    <div style="padding: 0.5rem">Context menu content</div>
  </DanxPopover>
</template>
```

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
