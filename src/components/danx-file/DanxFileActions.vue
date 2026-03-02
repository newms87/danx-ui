<!--
/**
 * DanxFileActions - Hover action overlay for DanxFile
 *
 * Internal sub-component (not exported from public API).
 * Renders download and remove action buttons in the hover overlay.
 * The remove button uses a two-step confirmation: first click arms,
 * second click confirms. Auto-disarms after 3 seconds.
 *
 * @props
 *   file: PreviewFile - The file to act on
 *   downloadable: boolean - Show download button
 *   removable: boolean - Show remove button
 *
 * @emits
 *   download(event) - Download button clicked (preventable via event.preventDefault())
 *   remove(file) - Remove confirmed after 2-step confirmation
 *
 * @slots
 *   actions - Custom action buttons passed through from parent
 */
-->

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { DanxIcon } from "../icon";
import { DanxTooltip } from "../tooltip";
import { handleDownload } from "./file-download-helpers";
import type { DanxFileDownloadEvent, PreviewFile } from "./types";

const props = defineProps<{
  file: PreviewFile;
  downloadable: boolean;
  removable: boolean;
}>();

const emit = defineEmits<{
  download: [event: DanxFileDownloadEvent];
  remove: [file: PreviewFile];
}>();

defineSlots<{
  actions?(): unknown;
}>();

const REMOVE_CONFIRM_TIMEOUT_MS = 3000;

const removeArmed = ref(false);
let removeTimer: ReturnType<typeof setTimeout> | undefined;
onUnmounted(() => clearTimeout(removeTimer));

function onRemoveClick() {
  if (!removeArmed.value) {
    removeArmed.value = true;
    removeTimer = setTimeout(() => {
      removeArmed.value = false;
    }, REMOVE_CONFIRM_TIMEOUT_MS);
    return;
  }
  clearTimeout(removeTimer);
  removeArmed.value = false;
  emit("remove", props.file);
}

function onDownload() {
  handleDownload(props.file, (event) => emit("download", event));
}
</script>

<template>
  <div class="danx-file__actions" @click.stop>
    <slot name="actions" />

    <DanxTooltip v-if="downloadable" tooltip="Download" placement="top">
      <template #trigger>
        <button class="danx-file__action-btn danx-file__action-btn--download" @click="onDownload">
          <DanxIcon icon="download" />
        </button>
      </template>
    </DanxTooltip>

    <DanxTooltip
      v-if="removable"
      :tooltip="removeArmed ? 'Click again to confirm' : 'Remove'"
      placement="top"
    >
      <template #trigger>
        <button
          class="danx-file__action-btn danx-file__action-btn--remove"
          :class="{ 'danx-file__action-btn--armed': removeArmed }"
          @click="onRemoveClick"
        >
          <DanxIcon :icon="removeArmed ? 'confirm' : 'trash'" />
        </button>
      </template>
    </DanxTooltip>
  </div>
</template>
