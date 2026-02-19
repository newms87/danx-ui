# Popover Component

A trigger-anchored floating panel that positions itself relative to a trigger element.

## Features

- **Trigger Slot** - Wraps an inline anchor element for automatic positioning
- **Explicit Position** - Optional `{ x, y }` coordinates for cursor-positioned panels (e.g. context menus)
- **Trigger Modes** - Manual (v-model), hover (with close delay), and focus triggers
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
| `trigger` | `PopoverTrigger` | `"manual"` | How popover opens/closes |
| `hoverDelay` | `number` | `200` | Close delay (ms) for hover mode |

### PopoverPlacement

`"top" | "bottom" | "left" | "right"`

### PopoverPosition

`{ x: number; y: number }` - Viewport pixel coordinates for the panel's top-left corner.

### PopoverTrigger

`"manual" | "click" | "hover" | "focus"`

## Trigger Modes

The `trigger` prop controls how the popover opens and closes automatically.

### Manual (default)

The parent manages visibility via v-model. This is the current behavior — no automatic open/close.

### Click

Toggles the popover on click of the trigger element. No v-model binding required — state is managed internally. If v-model is bound, external changes are respected.

```vue
<DanxPopover trigger="click">
  <template #trigger><button>Toggle</button></template>
  <div style="padding: 0.75rem">Click the button again to close</div>
</DanxPopover>
```

### Hover

Opens on `mouseenter` and closes on `mouseleave` with a configurable delay. Moving the cursor from the trigger to the panel keeps the popover open. The `hoverDelay` prop (default 200ms) controls the close delay, giving users time to cross the gap.

```vue
<DanxPopover v-model="show" trigger="hover" :hover-delay="300">
  <template #trigger><button>Hover me</button></template>
  <div style="padding: 0.75rem">Tooltip-style content</div>
</DanxPopover>
```

### Focus

Opens on `focusin` and closes when focus leaves both the trigger and panel. Useful for input hints or form field helpers.

```vue
<DanxPopover v-model="show" trigger="focus">
  <template #trigger><input placeholder="Focus me" /></template>
  <div style="padding: 0.75rem">Helper text</div>
</DanxPopover>
```

Click-outside dismissal and Escape key work in all trigger modes as additive dismissal.

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

The `placement` prop controls where the panel appears relative to the trigger element. An 8px gap separates the trigger from the panel (configurable via `--dx-popover-offset`).

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
  --dx-popover-bg: #1a1a2e;
  --dx-popover-border: #7c3aed;
  --dx-popover-border-radius: 1rem;
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
| `--dx-popover-bg` | `--color-surface-elevated` | Background color |
| `--dx-popover-border` | `--color-border` | Border color |
| `--dx-popover-border-radius` | `0.5rem` | Corner radius |
| `--dx-popover-shadow` | `rgb(0 0 0 / 0.5)` | Box shadow color |
| `--dx-popover-text` | `--color-text` | Text color |
| `--dx-popover-offset` | `0.5rem` | Gap between trigger and panel |
| `--dx-popover-animation-duration` | `--duration-200` | Animation duration |
