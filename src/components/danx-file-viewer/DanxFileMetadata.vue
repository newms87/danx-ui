<!--
/**
 * DanxFileMetadata - File metadata and EXIF display panel
 *
 * Internal subcomponent of DanxFileViewer. Displays file metadata
 * and EXIF data as separate sections, each formatted as YAML via CodeViewer.
 *
 * Renders when either meta or exif has displayable entries. When both are present,
 * a visual separator divides the two sections. Show/hide logic is managed by the
 * parent via DanxSplitPanel.
 *
 * @props
 *   file: PreviewFile - File whose metadata/exif to display
 *
 * @tokens
 *   --dx-file-meta-bg - Panel background
 *   --dx-file-meta-border-color - Border color
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { CodeViewer } from "../code-viewer";
import { DanxScroll } from "../scroll";
import type { PreviewFile } from "../danx-file/types";
import { formatMeta, metaCount, formatExif, exifCount, hasAnyInfo } from "./file-metadata-helpers";

const props = defineProps<{
  file: PreviewFile;
}>();

const displayMeta = computed(() => formatMeta(props.file));
const hasMeta = computed(() => metaCount(props.file) > 0);
const displayExif = computed(() => formatExif(props.file));
const hasExif = computed(() => exifCount(props.file) > 0);
const hasInfo = computed(() => hasAnyInfo(props.file));
</script>

<template>
  <div v-if="hasInfo" class="danx-file-metadata">
    <div class="danx-file-metadata__header">
      <span class="danx-file-metadata__title">Info</span>
    </div>
    <DanxScroll class="danx-file-metadata__content" size="xs">
      <div v-if="hasMeta" class="danx-file-metadata__section">
        <span class="danx-file-metadata__section-title">Metadata</span>
        <CodeViewer :model-value="displayMeta" format="yaml" hide-footer />
      </div>
      <div v-if="hasMeta && hasExif" class="danx-file-metadata__separator" />
      <div v-if="hasExif" class="danx-file-metadata__section">
        <span class="danx-file-metadata__section-title">EXIF</span>
        <CodeViewer :model-value="displayExif" format="yaml" hide-footer />
      </div>
    </DanxScroll>
  </div>
</template>
