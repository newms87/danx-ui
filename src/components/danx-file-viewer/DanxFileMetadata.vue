<!--
/**
 * DanxFileMetadata - File metadata and EXIF display panel
 *
 * Internal subcomponent of DanxFileViewer. Displays file metadata
 * and EXIF data as separate sections, each formatted as YAML via CodeViewer.
 * Supports overlay and docked display modes with the mode persisted to localStorage.
 *
 * Renders when either meta or exif has displayable entries. When both are present,
 * a visual separator divides the two sections.
 *
 * @models
 *   mode: MetadataMode - Display mode (overlay or docked)
 *
 * @props
 *   file: PreviewFile - File whose metadata/exif to display
 *
 * @emits
 *   update:mode - Mode changed
 *   close - Close button clicked (overlay mode)
 *
 * @tokens
 *   --dx-file-meta-bg - Panel background
 *   --dx-file-meta-width - Panel width (docked mode)
 *   --dx-file-meta-border-color - Border color
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { CodeViewer } from "../code-viewer";
import { DanxButton } from "../button";
import { DanxScroll } from "../scroll";
import type { PreviewFile } from "../danx-file/types";
import type { MetadataMode } from "./types";
import { formatMeta, metaCount, formatExif, exifCount, hasAnyInfo } from "./file-metadata-helpers";

const props = defineProps<{
  file: PreviewFile;
}>();

const emit = defineEmits<{
  close: [];
}>();

const mode = defineModel<MetadataMode>("mode", { required: true });

const displayMeta = computed(() => formatMeta(props.file));
const hasMeta = computed(() => metaCount(props.file) > 0);
const displayExif = computed(() => formatExif(props.file));
const hasExif = computed(() => exifCount(props.file) > 0);
const hasInfo = computed(() => hasAnyInfo(props.file));

function toggleMode() {
  mode.value = mode.value === "overlay" ? "docked" : "overlay";
}
</script>

<template>
  <div v-if="hasInfo" class="danx-file-metadata" :class="`danx-file-metadata--${mode}`">
    <div class="danx-file-metadata__header">
      <span class="danx-file-metadata__title">Info</span>
      <div class="danx-file-metadata__header-actions">
        <DanxButton type="muted" size="sm" icon="gear" title="Toggle mode" @click="toggleMode" />
        <DanxButton
          v-if="mode === 'overlay'"
          type="muted"
          size="sm"
          icon="close"
          title="Close"
          @click="emit('close')"
        />
      </div>
    </div>
    <DanxScroll class="danx-file-metadata__content" size="xs">
      <div v-if="hasMeta" class="danx-file-metadata__section">
        <span class="danx-file-metadata__section-title">Metadata</span>
        <CodeViewer :model-value="displayMeta" format="yaml" theme="light" hide-footer />
      </div>
      <div v-if="hasMeta && hasExif" class="danx-file-metadata__separator" />
      <div v-if="hasExif" class="danx-file-metadata__section">
        <span class="danx-file-metadata__section-title">EXIF</span>
        <CodeViewer :model-value="displayExif" format="yaml" theme="light" hide-footer />
      </div>
    </DanxScroll>
  </div>
</template>
