<!--
/**
 * DanxFileNavigator - Responsive standalone file viewer
 *
 * A responsive file viewer that fills its container. Completely independent
 * from DanxFile. Can be embedded anywhere — in a dialog, sidebar, or page section.
 * Supports image and video preview, navigation between related files,
 * keyboard navigation, and download.
 *
 * @models
 *   fileInPreview: PreviewFile | null - Currently active file (emits on navigation)
 *
 * @props
 *   file: PreviewFile - The main/anchor file (required)
 *   relatedFiles?: PreviewFile[] - Related files for carousel navigation
 *   downloadable?: boolean - Show download button in header
 *   closable?: boolean - Show close button in header
 *
 * @emits
 *   update:fileInPreview(file | null) - Active file changed
 *   download(file) - Download clicked (also auto-downloads)
 *   loadChildren(file) - Children needed (parent fetches and updates file.children)
 *   close - Close button clicked
 *
 * @slots
 *   header-actions - Extra buttons in the header bar
 *
 * @tokens
 *   --dx-file-nav-bg - Viewer background
 *   --dx-file-nav-header-bg - Header background
 *   --dx-file-nav-header-color - Header text color
 *   --dx-file-nav-arrow-size - Navigation arrow size
 *   --dx-file-nav-arrow-color - Navigation arrow color
 *   --dx-file-nav-arrow-bg - Navigation arrow background
 *   --dx-file-nav-counter-color - Slide counter color
 *   --dx-file-strip-gap - Thumbnail strip gap
 *   --dx-file-strip-thumb-size - Thumbnail strip thumb size
 *   --dx-file-strip-active-border - Active thumbnail border
 *   --dx-file-strip-bg - Strip background
 *
 * @example
 *   <DanxFileNavigator
 *     :file="mainFile"
 *     v-model:file-in-preview="activeFile"
 *     :related-files="relatedFiles"
 *     downloadable
 *     closable
 *     @close="showNav = false"
 *   />
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { DanxButton } from "../button";
import { DanxIcon } from "../icon";
import { downloadFile } from "../../shared/download";
import { resolveFileUrl, isImage, isVideo, hasChildren } from "../danx-file/file-helpers";
import type { PreviewFile } from "../danx-file/types";
import { useDanxFileNavigator } from "./useDanxFileNavigator";
import { useDanxFileMetadata } from "./useDanxFileMetadata";
import DanxFileThumbnailStrip from "./DanxFileThumbnailStrip.vue";
import DanxFileMetadata from "./DanxFileMetadata.vue";
import DanxFileChildrenMenu from "./DanxFileChildrenMenu.vue";

const props = withDefaults(
  defineProps<{
    file: PreviewFile;
    relatedFiles?: PreviewFile[];
    downloadable?: boolean;
    closable?: boolean;
  }>(),
  {
    relatedFiles: () => [],
    downloadable: false,
    closable: false,
  }
);

const emit = defineEmits<{
  "update:fileInPreview": [file: PreviewFile | null];
  download: [file: PreviewFile];
  loadChildren: [file: PreviewFile];
  close: [];
}>();

const fileInPreview = defineModel<PreviewFile | null>("fileInPreview", {
  default: null,
});

defineSlots<{
  "header-actions"?(): unknown;
}>();

const {
  currentFile,
  allFiles,
  hasNext,
  hasPrev,
  slideLabel,
  next,
  prev,
  goTo,
  hasParent,
  backFromChild,
  diveIntoChild,
} = useDanxFileNavigator({
  file: toRef(props, "file"),
  relatedFiles: toRef(props, "relatedFiles"),
  onNavigate: (f) => {
    fileInPreview.value = f;
  },
});

// Sync fileInPreview on mount
watch(
  currentFile,
  (f) => {
    fileInPreview.value = f;
  },
  { immediate: true }
);

// Metadata and children state
const { mode: metadataMode, metaCount } = useDanxFileMetadata();
const showMetadata = ref(false);
const hasMetadata = computed(() => metaCount(currentFile.value) > 0);
const showChildrenMenu = computed(
  () => hasChildren(currentFile.value) || !currentFile.value.children
);

function toggleMetadata() {
  showMetadata.value = !showMetadata.value;
}

const fileUrl = computed(() => resolveFileUrl(currentFile.value));
const showImage = computed(() => isImage(currentFile.value) && !!fileUrl.value);
const showVideo = computed(() => isVideo(currentFile.value) && !!fileUrl.value);

function onDownload() {
  const url = resolveFileUrl(currentFile.value);
  if (url) {
    downloadFile(url, currentFile.value.name);
  }
  emit("download", currentFile.value);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  }
}
</script>

<template>
  <div class="danx-file-navigator" tabindex="0" @keydown="onKeydown">
    <!-- Header -->
    <div class="danx-file-navigator__header">
      <button
        v-if="hasParent"
        class="danx-file-navigator__back-btn"
        title="Back"
        @click="backFromChild"
      >
        <DanxIcon icon="back" />
      </button>

      <span class="danx-file-navigator__filename">{{ currentFile.name }}</span>

      <span v-if="slideLabel" class="danx-file-navigator__counter">{{ slideLabel }}</span>

      <div class="danx-file-navigator__header-actions">
        <slot name="header-actions" />

        <DanxFileChildrenMenu
          v-if="showChildrenMenu"
          :file="currentFile"
          @select="diveIntoChild"
          @load-children="emit('loadChildren', $event)"
        />

        <DanxButton
          v-if="hasMetadata"
          type="muted"
          size="sm"
          icon="info"
          title="Metadata"
          @click="toggleMetadata"
        />

        <DanxButton
          v-if="downloadable"
          type="muted"
          size="sm"
          icon="download"
          title="Download"
          @click="onDownload"
        />

        <DanxButton
          v-if="closable"
          type="muted"
          size="sm"
          icon="close"
          title="Close"
          @click="emit('close')"
        />
      </div>
    </div>

    <!-- Main content area with optional docked metadata -->
    <div class="danx-file-navigator__body">
      <div class="danx-file-navigator__content">
        <!-- Previous arrow -->
        <button
          v-if="hasPrev"
          class="danx-file-navigator__arrow danx-file-navigator__arrow--prev"
          title="Previous"
          @click="prev"
        >
          <DanxIcon icon="chevron-left" />
        </button>

        <!-- File preview -->
        <div class="danx-file-navigator__preview">
          <img
            v-if="showImage"
            class="danx-file-navigator__image"
            :src="fileUrl"
            :alt="currentFile.name"
          />
          <video
            v-else-if="showVideo"
            class="danx-file-navigator__video"
            :src="fileUrl"
            controls
            :key="currentFile.id"
          />
          <div v-else class="danx-file-navigator__no-preview">
            <DanxIcon icon="document" />
            <span>{{ currentFile.name }}</span>
          </div>
        </div>

        <!-- Next arrow -->
        <button
          v-if="hasNext"
          class="danx-file-navigator__arrow danx-file-navigator__arrow--next"
          title="Next"
          @click="next"
        >
          <DanxIcon icon="chevron-right" />
        </button>

        <!-- Metadata overlay (positioned absolute inside content) -->
        <DanxFileMetadata
          v-if="showMetadata && metadataMode === 'overlay'"
          v-model:mode="metadataMode"
          :file="currentFile"
          @close="showMetadata = false"
        />
      </div>

      <!-- Metadata docked (flex sibling to content) -->
      <DanxFileMetadata
        v-if="showMetadata && metadataMode === 'docked'"
        v-model:mode="metadataMode"
        :file="currentFile"
        @close="showMetadata = false"
      />
    </div>

    <!-- Thumbnail strip -->
    <DanxFileThumbnailStrip :files="allFiles" :active-file-id="currentFile.id" @select="goTo" />
  </div>
</template>
