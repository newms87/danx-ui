<script setup>
import { ref } from "vue";
import { DanxDragHandle, useDragAndDrop, DanxIcon } from "danx-ui";

const items = ref([
  { id: "a", label: "Design review", icon: "document" },
  { id: "b", label: "Write proposal", icon: "code" },
  { id: "c", label: "Ship release", icon: "gear" },
  { id: "d", label: "Retro notes", icon: "folder" },
]);

const { isDragging, isDropTarget, registerItemRef, startDrag, onHandleKeydown, announcement } =
  useDragAndDrop(items);
</script>

<template>
  <ul class="flex flex-col gap-2 max-w-sm">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      :ref="(el) => registerItemRef(index, el)"
      class="danx-drag-item flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
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
      <DanxIcon :icon="item.icon" class="w-4 h-4 text-text-muted" />
      <span class="text-sm">{{ item.label }}</span>
    </li>
  </ul>
  <span class="sr-only" aria-live="polite">{{ announcement }}</span>
</template>
