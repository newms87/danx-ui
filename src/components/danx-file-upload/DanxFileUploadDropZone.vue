<!--
/**
 * DanxFileUploadDropZone - Internal drop zone sub-component
 *
 * Wraps the upload area with drag-and-drop and paste event handling. Purely
 * presentational — forwards DOM events to the parent composable handlers.
 * Focusable (tabindex="0") so it can receive paste events.
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
 *   paste(files: FileList) - Files pasted while the zone is focused
 *
 * @slots
 *   default - Content inside the drop zone
 */
-->

<script setup lang="ts">
const props = defineProps<{
  isDragging: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  dragEnter: [];
  dragLeave: [];
  drop: [files: FileList];
  paste: [files: FileList];
}>();

function onDragEnter(event: DragEvent) {
  event.preventDefault();
  if (!event.dataTransfer) return;
  // DXUI-69: skip emit so the --active hover class never flashes while disabled/readonly
  if (props.disabled) return;
  emit("dragEnter");
}

function onDragLeave() {
  emit("dragLeave");
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  if (props.disabled) return;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    emit("drop", files);
  }
}

function onPaste(event: ClipboardEvent) {
  if (props.disabled) return;
  const files = event.clipboardData?.files;
  if (files && files.length > 0) {
    emit("paste", files);
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
    tabindex="0"
    @dragenter="onDragEnter"
    @dragover.prevent
    @dragleave="onDragLeave"
    @drop="onDrop"
    @paste="onPaste"
  >
    <slot />
  </div>
</template>
