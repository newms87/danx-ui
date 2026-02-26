<!--
/**
 * DanxFileProgress - Progress overlay for DanxFile
 *
 * Internal sub-component (not exported from public API).
 * Renders a progress bar with status text over the file preview.
 * Compact (xs) mode shows an icon + slim bar; standard mode shows text + striped bar.
 *
 * @props
 *   file: PreviewFile - The file with progress state
 *   isXsSize: boolean - Whether to render compact (icon-only) variant
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxIcon } from "../icon";
import { DanxProgressBar } from "../progress-bar";
import type { PreviewFile } from "./types";

const props = defineProps<{
  file: PreviewFile;
  isXsSize: boolean;
}>();

const progressValue = computed(() => props.file.progress ?? 0);

const progressText = computed(() => {
  if (props.file.statusMessage) return props.file.statusMessage;
  return `Uploading... ${progressValue.value}%`;
});
</script>

<template>
  <div class="danx-file__progress" :class="{ 'danx-file__progress--compact': isXsSize }">
    <template v-if="isXsSize">
      <DanxIcon icon="clock" />
      <DanxProgressBar :value="progressValue" size="sm" :show-text="false" />
    </template>
    <template v-else>
      <span class="danx-file__progress-text">{{ progressText }}</span>
      <DanxProgressBar
        :value="progressValue"
        size="sm"
        striped
        animate-stripes
        :show-text="false"
      />
    </template>
  </div>
</template>
