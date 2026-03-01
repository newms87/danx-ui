<!--
/**
 * DanxFileUploadDropZone - Internal drop zone sub-component
 *
 * Wraps the upload area with drag-and-drop event handling. Purely
 * presentational — forwards DOM events to the parent composable handlers.
 *
 * Uses a drag depth counter pattern to handle child element dragleave
 * events correctly (dragleave fires when entering a child element).
 *
 * @props
 *   isDragging: boolean - Whether a drag operation is active over the zone
 *   disabled: boolean - Whether the drop zone is disabled
 *
 * @emits
 *   dragEnter - Drag entered the zone (increment depth)
 *   dragLeave - Drag left the zone (decrement depth)
 *   drop(files: FileList) - Files dropped on the zone
 *
 * @slots
 *   default - Content inside the drop zone
 */
-->

<script setup lang="ts">
defineProps<{
  isDragging: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  dragEnter: [];
  dragLeave: [];
  drop: [files: FileList];
}>();

function onDragEnter(event: DragEvent) {
  event.preventDefault();
  if (!event.dataTransfer) return;
  emit("dragEnter");
}

function onDragLeave() {
  emit("dragLeave");
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    emit("drop", files);
  }
}
</script>

<template>
  <div
    class="danx-file-upload-drop-zone"
    :class="{
      'danx-file-upload-drop-zone--active': isDragging && !disabled,
      'danx-file-upload-drop-zone--disabled': disabled,
    }"
    @dragenter="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <slot />
  </div>
</template>
