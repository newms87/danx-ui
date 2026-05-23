# DanxZoomable

Photoshop-style zoom + pan wrapper. Drop any content inside `DanxZoomable` to make it zoomable + pannable with Ctrl/Cmd-modifier gestures. Reusable beyond the file viewer — wrap an image, a canvas, an SVG, an iframe template preview, anything.

## Features

- Ctrl/Cmd + scroll wheel → zoom (preventDefault hijacks the browser's page-zoom shortcut)
- Ctrl/Cmd + drag → pan (Photoshop-style: content floats inside a fixed-size container)
- Ctrl/Cmd + `+` / `=` / `-` / `_` → keyboard zoom step
- Ctrl/Cmd + `0` → reset zoom to 100
- Dblclick → reset zoom + pan
- Multiple instances coexist on the page (keyboard scoped to focused wrapper)
- Bundled `DanxZoomControls` slider + readout + reset button

## Basic Usage

```vue
<script setup>
import { ref } from "vue";
import { DanxZoomable } from "danx-ui";

const zoom = ref(100);
const pan = ref({ x: 0, y: 0 });
</script>

<template>
  <DanxZoomable v-model:zoom="zoom" v-model:pan="pan">
    <img src="diagram.svg" />
  </DanxZoomable>
</template>
```

## With Bundled Controls

```vue
<script setup>
import { ref } from "vue";
import { DanxZoomable, DanxZoomControls } from "danx-ui";

const zoom = ref(100);
</script>

<template>
  <div class="flex flex-col gap-2">
    <DanxZoomControls v-model:zoom="zoom" />
    <DanxZoomable v-model:zoom="zoom">
      <img src="diagram.svg" />
    </DanxZoomable>
  </div>
</template>
```

`DanxZoomControls` can also render inside `DanxZoomable`'s `controls` slot for an inline overlay:

```vue
<DanxZoomable v-model:zoom="zoom">
  <template #controls>
    <DanxZoomControls v-model:zoom="zoom" compact />
  </template>
  <YourContent />
</DanxZoomable>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `number` | `25` | Minimum zoom percent |
| `max` | `number` | `400` | Maximum zoom percent |
| `step` | `number` | `10` | Zoom step (wheel + keyboard) |
| `panDisabled` | `boolean` | `false` | Disable Ctrl+drag pan |
| `wheelDisabled` | `boolean` | `false` | Disable Ctrl+wheel zoom |
| `keyboardDisabled` | `boolean` | `false` | Disable Ctrl+/-/=/0 keyboard zoom |
| `showHint` | `boolean` | `true` | Show modifier-key hint pill |

## Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `zoom` | `number` | `100` | Zoom percent |
| `pan` | `{ x: number; y: number }` | `{x:0,y:0}` | Pan offset in unscaled px |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:zoom` | `number` | Zoom changed |
| `update:pan` | `Pan` | Pan changed |
| `reset` | – | User triggered dblclick reset |

## Slots

| Slot | Description |
|------|-------------|
| `default` | The zoomable content |
| `controls` | Overlay controls rendered above the content (top-right) |

## DanxZoomControls Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` / `max` / `step` | `number` | `25` / `400` / `10` | Slider bounds + step |
| `compact` | `boolean` | `false` | Hide the percent readout |

## useZoomable Composable

When you need the gesture handlers without the wrapper's template (e.g., to integrate with your own root element):

```ts
import { useZoomable } from "danx-ui";

const { isDragging, panInputActive, modifierKeyLabel, onDragStart, onDblClick } = useZoomable({
  zoom,         // Ref<number>
  pan,          // Ref<{x:number,y:number}>
  rootRef,      // Ref<HTMLElement | null> — wraps the zoomable element
  min, max, step,                        // optional refs
  panDisabled, wheelDisabled, keyboardDisabled, // optional refs
  onReset: () => {},                     // optional callback fired on dblclick reset
});
```

The composable owns wheel + keyboard + window mouse listeners. Wheel listener attaches to `rootRef.value` with `{ passive: false }` so `preventDefault` works. Keyboard + window drag listeners are window-scoped in the **capture phase**, so they fire before any descendant container's bubble-phase `stopPropagation` — drag-pan and the grab cursor keep working inside containers like `DanxDialog` that isolate inner events. Keyboard zoom still only acts when focus is inside `rootRef`, so multiple Zoomables can coexist.

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-zoomable-bg` | `var(--color-surface-sunken)` | Container background |
| `--dx-zoomable-hint-bg` | `var(--color-surface-overlay)` | Hint pill background |
| `--dx-zoomable-hint-color` | `var(--color-text-inverted)` | Hint pill text |
| `--dx-zoomable-hint-border` | `transparent` | Hint pill border |
| `--dx-zoomable-kbd-bg` | `var(--color-surface)` | Inline `<kbd>` background |
| `--dx-zoomable-kbd-color` | `var(--color-text)` | Inline `<kbd>` text |
| `--dx-zoomable-kbd-border` | `var(--color-border-strong)` | Inline `<kbd>` border |
| `--dx-zoomable-controls-bg` | `var(--color-surface-sunken)` | Bundled controls bar background |
| `--dx-zoomable-controls-color` | `var(--color-text)` | Bundled controls bar text |
