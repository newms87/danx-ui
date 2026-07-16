<script setup>
import { ref } from "vue";
import { DanxDragHandle, useDragAndDrop, DanxChip } from "danx-ui";

const steps = ref([
  { id: "1", label: "Plan" },
  { id: "2", label: "Design" },
  { id: "3", label: "Build" },
  { id: "4", label: "Ship" },
]);

const { isDragging, isDropTarget, registerItemRef, startDrag, onHandleKeydown } = useDragAndDrop(
  steps,
  { orientation: "horizontal" }
);
</script>

<template>
  <ul class="flex gap-2">
    <li
      v-for="(step, index) in steps"
      :key="step.id"
      :ref="(el) => registerItemRef(index, el)"
      class="danx-drag-item flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5"
      :class="{
        'danx-drag-item--dragging': isDragging(index),
        'danx-drag-item--drop-target': isDropTarget(index),
      }"
    >
      <DanxDragHandle
        :label="`Reorder ${step.label}`"
        @drag-start="(e) => startDrag(index, e)"
        @keydown="(e) => onHandleKeydown(index, e)"
      />
      <DanxChip variant="info">{{ step.label }}</DanxChip>
    </li>
  </ul>
</template>
