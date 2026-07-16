<!--
/**
 * DanxFileError - Error overlay for DanxFile
 *
 * Internal sub-component (not exported from public API).
 * Renders an error state overlay on the file preview, plus a retry button
 * to re-attempt the upload using the original File object.
 * Compact sizes (xs/sm/md) show icon-only with a hover popover for the message.
 * Large sizes show the full error text inline.
 *
 * @props
 *   file: PreviewFile - The file with error state
 *   isCompactDisplay: boolean - Whether to use icon-only + popover variant
 *
 * @emits
 *   retry(file) - Retry button clicked
 */
-->

<script setup lang="ts">
import { DanxIcon } from "../icon";
import { DanxPopover } from "../popover";
import type { PreviewFile } from "./types";

defineProps<{
  file: PreviewFile;
  isCompactDisplay: boolean;
}>();

const emit = defineEmits<{
  retry: [file: PreviewFile];
}>();

function onRetryClick(file: PreviewFile) {
  emit("retry", file);
}
</script>

<template>
  <template v-if="isCompactDisplay">
    <DanxPopover trigger="hover" placement="top" variant="danger" class="danx-file__error-popover">
      <template #trigger>
        <div class="danx-file__error danx-file__error--compact">
          <DanxIcon icon="warning-triangle" />
        </div>
      </template>
      <div class="danx-file__error-popover-content">
        <span>{{ file.error }}</span>
        <button
          type="button"
          class="danx-file__error-retry-btn"
          @click.stop="onRetryClick(file)"
        >
          <DanxIcon icon="refresh" />
          Retry
        </button>
      </div>
    </DanxPopover>
  </template>
  <div v-else class="danx-file__error">
    <DanxIcon icon="warning-triangle" />
    <span class="danx-file__error-text">{{ file.error }}</span>
    <button
      type="button"
      class="danx-file__error-retry-btn"
      @click.stop="onRetryClick(file)"
    >
      <DanxIcon icon="refresh" />
      Retry
    </button>
  </div>
</template>
