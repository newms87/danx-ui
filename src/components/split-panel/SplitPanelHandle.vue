<script setup lang="ts">
/**
 * SplitPanelHandle - Drag/keyboard-resize handle between adjacent split panels
 *
 * Minimal sub-component that renders a focusable separator between
 * two panels in a DanxSplitPanel layout. Emits a dragStart event on
 * pointerdown, and a resize event on arrow/Home/End keydown, for the
 * parent to carry out the actual resize logic.
 *
 * @props
 *   horizontal: boolean - Layout orientation (default: false for vertical columns)
 *   valueNow: number - Current split value (%) for aria-valuenow
 *   valueMin: number - Minimum split value (%) for aria-valuemin
 *   valueMax: number - Maximum split value (%) for aria-valuemax
 *
 * @emits
 *   dragStart - Emitted with the PointerEvent when the user starts dragging
 *   resize - Emitted with a direction when an arrow/Home/End key is pressed
 *
 * @tokens
 *   --dx-split-panel-handle-size - Handle hit area width/height (default: 8px)
 *   --dx-split-panel-handle-color - Grip indicator color (default: var(--color-border))
 *   --dx-split-panel-handle-hover - Grip color on hover (default: var(--color-interactive))
 *   --dx-split-panel-handle-active - Grip color while dragging (default: var(--color-interactive))
 */

const props = defineProps<{
  /** Layout orientation — true for horizontal (row) split */
  horizontal?: boolean;
  /** Current split value (%), reflected as aria-valuenow */
  valueNow?: number;
  /** Minimum split value (%), reflected as aria-valuemin */
  valueMin?: number;
  /** Maximum split value (%), reflected as aria-valuemax */
  valueMax?: number;
}>();

const emit = defineEmits<{
  dragStart: [event: PointerEvent];
  resize: [direction: "decrease" | "increase" | "min" | "max"];
}>();

function onPointerDown(event: PointerEvent) {
  emit("dragStart", event);
}

function onKeydown(event: KeyboardEvent) {
  const decreaseKey = props.horizontal ? "ArrowUp" : "ArrowLeft";
  const increaseKey = props.horizontal ? "ArrowDown" : "ArrowRight";

  if (event.key === decreaseKey) {
    event.preventDefault();
    emit("resize", "decrease");
  } else if (event.key === increaseKey) {
    event.preventDefault();
    emit("resize", "increase");
  } else if (event.key === "Home") {
    event.preventDefault();
    emit("resize", "min");
  } else if (event.key === "End") {
    event.preventDefault();
    emit("resize", "max");
  }
}
</script>

<template>
  <div
    class="danx-split-panel-handle"
    :class="{ 'danx-split-panel-handle--horizontal': horizontal }"
    role="separator"
    :aria-orientation="horizontal ? 'horizontal' : 'vertical'"
    :aria-valuenow="valueNow"
    :aria-valuemin="valueMin"
    :aria-valuemax="valueMax"
    tabindex="0"
    @pointerdown="onPointerDown"
    @keydown="onKeydown"
  >
    <div class="danx-split-panel-handle__grip" />
  </div>
</template>
