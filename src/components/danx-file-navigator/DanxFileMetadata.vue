<!--
/**
 * DanxFileMetadata - File metadata display panel
 *
 * Internal subcomponent of DanxFileNavigator. Displays file metadata
 * formatted as YAML via CodeViewer. Supports overlay and docked display
 * modes with the mode persisted to localStorage.
 *
 * @models
 *   mode: MetadataMode - Display mode (overlay or docked)
 *
 * @props
 *   file: PreviewFile - File whose metadata to display
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
import type { PreviewFile, MetadataMode } from "../danx-file/types";
import { useDanxFileMetadata } from "./useDanxFileMetadata";

const props = defineProps<{
  file: PreviewFile;
}>();

const emit = defineEmits<{
  close: [];
}>();

const mode = defineModel<MetadataMode>("mode", { required: true });

const { formatMeta, metaCount } = useDanxFileMetadata();

const displayMeta = computed(() => formatMeta(props.file));
const hasMetadata = computed(() => metaCount(props.file) > 0);

function toggleMode() {
  mode.value = mode.value === "overlay" ? "docked" : "overlay";
}
</script>

<template>
  <div v-if="hasMetadata" class="danx-file-metadata" :class="`danx-file-metadata--${mode}`">
    <div class="danx-file-metadata__header">
      <span class="danx-file-metadata__title">Metadata</span>
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
    <div class="danx-file-metadata__content">
      <CodeViewer :model-value="displayMeta" format="yaml" theme="light" hide-footer />
    </div>
  </div>
</template>
