<script setup lang="ts">
/**
 * DanxDragHandle - Grip affordance that scopes the drag activation region of a list row
 *
 * Small, focusable button rendering a grip icon. Pairs with useDragAndDrop:
 * bind `dragStart` to `startDrag(index, event)` and `keydown` to
 * `onHandleKeydown(index, event)`. Scoping drag activation to this handle
 * (rather than the whole row) keeps the rest of the row's content —
 * buttons, links, inputs — usable without triggering a drag.
 *
 * @emits
 *   dragStart - Emitted with the PointerEvent on pointerdown
 *   keydown - Emitted with the KeyboardEvent on keydown (grab/move/drop/cancel)
 *
 * @props
 *   label: string - Accessible name for the handle (default: "Reorder item")
 *
 * @tokens
 *   --dx-drag-handle-size - Handle hit area width/height (default: 1.75rem)
 *   --dx-drag-handle-color - Grip icon color (default: var(--color-text-subtle))
 *   --dx-drag-handle-hover - Grip icon color on hover/focus (default: var(--color-interactive))
 *   --dx-drag-handle-active - Grip icon color while dragging (default: var(--color-interactive))
 *   --dx-drag-handle-focus-ring - Focus ring color (default: var(--color-focus-ring))
 *
 * @example
 *   <DanxDragHandle
 *     :label="`Reorder ${item.label}`"
 *     :class="{ 'danx-drag-handle--active': isDragging(index) }"
 *     @drag-start="(e) => startDrag(index, e)"
 *     @keydown="(e) => onHandleKeydown(index, e)"
 *   />
 */
import { DanxIcon } from "../icon";

withDefaults(
  defineProps<{
    /** Accessible name announced for this handle. */
    label?: string;
  }>(),
  { label: "Reorder item" }
);

const emit = defineEmits<{
  dragStart: [event: PointerEvent];
  keydown: [event: KeyboardEvent];
}>();

defineOptions({ inheritAttrs: false });

function onPointerDown(event: PointerEvent): void {
  emit("dragStart", event);
}

function onKeydown(event: KeyboardEvent): void {
  emit("keydown", event);
}
</script>

<template>
  <button
    type="button"
    class="danx-drag-handle"
    :aria-label="label"
    aria-roledescription="draggable item"
    v-bind="$attrs"
    @pointerdown="onPointerDown"
    @keydown="onKeydown"
  >
    <DanxIcon icon="handle" class="danx-drag-handle__icon" />
  </button>
</template>
