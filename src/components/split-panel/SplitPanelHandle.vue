<script setup lang="ts">
/**
 * SplitPanelHandle - Drag handle between adjacent split panels
 *
 * Minimal sub-component that renders a draggable separator between
 * two panels in a DanxSplitPanel layout. Emits a dragStart event
 * on pointerdown for the parent to initiate resize logic.
 *
 * @props
 *   horizontal: boolean - Layout orientation (default: false for vertical columns)
 *
 * @emits
 *   dragStart - Emitted with the PointerEvent when the user starts dragging
 *
 * @tokens
 *   --dx-split-panel-handle-size - Handle hit area width/height (default: 8px)
 *   --dx-split-panel-handle-color - Grip indicator color (default: var(--color-border))
 *   --dx-split-panel-handle-hover - Grip color on hover (default: var(--color-interactive))
 *   --dx-split-panel-handle-active - Grip color while dragging (default: var(--color-interactive))
 */

defineProps<{
  /** Layout orientation — true for horizontal (row) split */
  horizontal?: boolean;
}>();

const emit = defineEmits<{
  dragStart: [event: PointerEvent];
}>();

function onPointerDown(event: PointerEvent) {
  emit("dragStart", event);
}
</script>

<template>
  <div
    class="danx-split-panel-handle"
    :class="{ 'danx-split-panel-handle--horizontal': horizontal }"
    role="separator"
    :aria-orientation="horizontal ? 'horizontal' : 'vertical'"
    @pointerdown="onPointerDown"
  >
    <div class="danx-split-panel-handle__grip" />
  </div>
</template>
