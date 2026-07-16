# Drag And Drop

`useDragAndDrop` manages pointer- and keyboard-driven reordering of an array v-model. Pair it with `DanxDragHandle` to scope the drag activation region of each row so the rest of a row's content (buttons, links, inputs) stays usable.

## useDragAndDrop(items, options?)

| Argument | Type | Description |
|----------|------|-------------|
| `items` | `Ref<T[]>` | v-model ref of the ordered array; mutated directly on drop |
| `options.orientation` | `"vertical" \| "horizontal"` | Which arrow keys move items and which axis pointer drags read (default: `"vertical"`) |

### Returns

| Field | Type | Description |
|-------|------|-------------|
| `draggingIndex` | `Ref<number \| null>` | Index of the item currently being dragged, or `null` when idle |
| `dropTargetIndex` | `Ref<number \| null>` | Index the dragged item would land on if dropped now |
| `announcement` | `Ref<string>` | Latest ARIA live-region text — bind to a visually-hidden `aria-live="polite"` element |
| `isDragging(index)` | `(index: number) => boolean` | Whether the item at `index` is being dragged — style it (e.g. lower opacity) |
| `isDropTarget(index)` | `(index: number) => boolean` | Whether the item at `index` is the current drop target — render a drop indicator |
| `registerItemRef(index, el)` | `(index: number, el: HTMLElement \| null) => void` | Bind to each row's `ref` callback so the composable can measure positions |
| `startDrag(index, event)` | `(index: number, event: PointerEvent) => void` | Bind to the handle's `dragStart` |
| `onHandleKeydown(index, event)` | `(index: number, event: KeyboardEvent) => void` | Bind to the handle's `keydown` |

## DanxDragHandle

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `"Reorder item"` | Accessible name announced for this handle |

| Emit | Payload | Description |
|------|---------|--------------|
| `dragStart` | `PointerEvent` | Fired on pointerdown — forward to `startDrag` |
| `keydown` | `KeyboardEvent` | Fired on keydown — forward to `onHandleKeydown` |

## Keyboard Reordering

- **Space / Enter** — grab the focused item, or drop it if already grabbed
- **Arrow Up / Down** (vertical) or **Arrow Left / Right** (horizontal) — move the grabbed item one position
- **Escape** — cancel and release without moving

Each action updates `announcement` with a screen-reader message describing what happened.

## FLIP Transition

Moving an item (by pointer drop or keyboard step) animates every displaced row from its previous position to its new one using a transform transition, instead of snapping instantly. The duration is controlled by the `--dx-drag-flip-duration` token.

## Usage

```vue
<script setup>
import { ref } from "vue";
import { DanxDragHandle, useDragAndDrop } from "danx-ui";

const items = ref([
  { id: "a", label: "First" },
  { id: "b", label: "Second" },
  { id: "c", label: "Third" },
]);

const { isDragging, isDropTarget, registerItemRef, startDrag, onHandleKeydown, announcement } =
  useDragAndDrop(items);
</script>

<template>
  <ul>
    <li
      v-for="(item, index) in items"
      :key="item.id"
      :ref="(el) => registerItemRef(index, el as HTMLElement | null)"
      class="danx-drag-item"
      :class="{
        'danx-drag-item--dragging': isDragging(index),
        'danx-drag-item--drop-target': isDropTarget(index),
      }"
    >
      <DanxDragHandle
        :label="`Reorder ${item.label}`"
        @drag-start="(e) => startDrag(index, e)"
        @keydown="(e) => onHandleKeydown(index, e)"
      />
      {{ item.label }}
    </li>
  </ul>
  <span class="sr-only" aria-live="polite">{{ announcement }}</span>
</template>
```

## CSS Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-drag-handle-size` | `1.75rem` | Handle hit area |
| `--dx-drag-handle-color` | `var(--color-text-subtle)` | Grip icon color |
| `--dx-drag-handle-hover` | `var(--color-interactive)` | Grip icon color on hover/focus |
| `--dx-drag-handle-active` | `var(--color-interactive)` | Grip icon color while dragging |
| `--dx-drag-handle-focus-ring` | `var(--color-focus-ring)` | Focus ring color |
| `--dx-drag-flip-duration` | `200ms` | FLIP transition duration |
| `--dx-drag-item-drop-indicator` | `var(--color-interactive)` | Drop indicator line color (optional `.danx-drag-item` utility class) |
