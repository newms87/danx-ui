<!--
/**
 * DanxFileViewer - Responsive standalone file viewer with virtual carousel
 *
 * A responsive file viewer that fills its container. Completely independent
 * from DanxFile. Can be embedded anywhere — in a dialog, sidebar, or page section.
 * Supports image and video preview, navigation between related files,
 * keyboard navigation, and download. Uses a virtual carousel that renders
 * current ±2 slides with opacity transitions for smooth navigation.
 *
 * @models
 *   fileInPreview: PreviewFile | null - Currently active file (emits on navigation)
 *
 * @props
 *   file: PreviewFile - The main/anchor file (required)
 *   relatedFiles?: PreviewFile[] - Related files for carousel navigation
 *   downloadable?: boolean - Show download button in header
 *
 * @emits
 *   update:fileInPreview(file | null) - Active file changed
 *   download(file) - Download clicked (also auto-downloads)
 *   loadChildren(file) - Children needed (parent fetches and updates file.children)
 *
 * @slots
 *   header-actions - Extra buttons in the header bar
 *
 * @tokens
 *   --dx-file-nav-bg - Viewer background
 *   --dx-file-nav-header-bg - Header background
 *   --dx-file-nav-header-color - Header text color
 *   --dx-file-nav-header-opacity - Header resting opacity (hover → 1)
 *   --dx-file-nav-header-padding - Header horizontal padding
 *   --dx-file-nav-arrow-size - Navigation arrow size
 *   --dx-file-nav-arrow-color - Navigation arrow color
 *   --dx-file-nav-arrow-bg - Navigation arrow background
 *   --dx-file-nav-arrow-bg-hover - Navigation arrow hover background
 *   --dx-file-nav-counter-color - Slide counter color
 *   --dx-file-nav-slide-transition - Slide opacity transition duration
 *   --dx-file-strip-gap - Thumbnail strip gap
 *   --dx-file-strip-thumb-size - Thumbnail strip thumb size
 *   --dx-file-strip-active-border - Active thumbnail border
 *   --dx-file-strip-bg - Strip background
 *   --dx-file-strip-inactive-opacity - Inactive thumbnail opacity
 *   --dx-file-strip-active-scale - Active thumbnail scale transform
 *
 * @example
 *   <DanxFileViewer
 *     :file="mainFile"
 *     v-model:file-in-preview="activeFile"
 *     :related-files="relatedFiles"
 *     downloadable
 *   />
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { DanxButton } from "../button";
import { DanxFile } from "../danx-file";
import { DanxIcon } from "../icon";
import { createDownloadEvent, triggerFileDownload } from "../danx-file/file-helpers";
import type { PreviewFile } from "../danx-file/types";
import type { DanxFileViewerEmits, DanxFileViewerProps, DanxFileViewerSlots } from "./types";
import { useDanxFileViewer } from "./useDanxFileViewer";
import { hasAnyInfo, metaCount, exifCount } from "./file-metadata-helpers";
import { useDanxFileMetadata } from "./useDanxFileMetadata";
import { useVirtualCarousel } from "./useVirtualCarousel";
import DanxFileThumbnailStrip from "./DanxFileThumbnailStrip.vue";
import DanxFileMetadata from "./DanxFileMetadata.vue";

const props = withDefaults(defineProps<DanxFileViewerProps>(), {
  relatedFiles: () => [],
  downloadable: false,
});

const emit = defineEmits<DanxFileViewerEmits>();

const fileInPreview = defineModel<PreviewFile | null>("fileInPreview", {
  default: null,
});

defineSlots<DanxFileViewerSlots>();

const {
  currentFile,
  currentIndex,
  activeFiles,
  hasNext,
  hasPrev,
  slideLabel,
  next,
  prev,
  goTo,
  hasParent,
  hasChildFiles,
  backFromChild,
  navigateToAncestor,
  breadcrumbs,
  diveIntoChildren,
} = useDanxFileViewer({
  file: toRef(props, "file"),
  relatedFiles: toRef(props, "relatedFiles"),
  onNavigate: (f) => {
    fileInPreview.value = f;
  },
});

// Virtual carousel: renders current ±2 slides for smooth opacity transitions
const { visibleSlides } = useVirtualCarousel(activeFiles, currentIndex);

// Sync fileInPreview on mount
watch(
  currentFile,
  (f) => {
    fileInPreview.value = f;
  },
  { immediate: true }
);

// Metadata state
const { mode: metadataMode } = useDanxFileMetadata();
const showMetadata = ref(false);
const hasMetadata = computed(() => hasAnyInfo(currentFile.value));
const infoCount = computed(() => metaCount(currentFile.value) + exifCount(currentFile.value));

// Emit loadChildren when the current file's children are undefined
watch(
  currentFile,
  (f) => {
    if (!f.children) {
      emit("loadChildren", f);
    }
  },
  { immediate: true }
);

function toggleMetadata() {
  showMetadata.value = !showMetadata.value;
}

function onDownload() {
  const event = createDownloadEvent(currentFile.value);
  emit("download", event);
  if (!event.prevented) {
    triggerFileDownload(currentFile.value);
  }
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

// --- Touch/swipe gestures ---

const SWIPE_THRESHOLD = 50;
let touchStartX = 0;
let touchStartY = 0;

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0];
  if (touch) {
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0];
  if (!touch) return;
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) {
      next();
    } else {
      prev();
    }
  }
}
</script>

<template>
  <div
    class="danx-file-viewer"
    tabindex="0"
    @keydown="onKeydown"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Header -->
    <div class="danx-file-viewer__header">
      <!-- Navigation buttons (parent / children) -->
      <div v-if="hasParent || hasChildFiles" class="danx-file-viewer__nav-buttons">
        <DanxButton
          v-if="hasParent"
          type="muted"
          size="sm"
          icon="chevron-up"
          tooltip="Go to parent"
          @click="backFromChild()"
        />
        <DanxButton
          v-if="hasChildFiles"
          type="muted"
          size="sm"
          icon="chevron-down"
          tooltip="View children"
          @click="diveIntoChildren()"
        />
      </div>

      <span class="danx-file-viewer__filename">{{ currentFile.name }}</span>

      <span v-if="slideLabel" class="danx-file-viewer__counter">{{ slideLabel }}</span>

      <div class="danx-file-viewer__header-actions">
        <slot name="header-actions" />

        <DanxButton
          v-if="hasMetadata"
          type="muted"
          size="sm"
          icon="info"
          tooltip="Metadata"
          @click="toggleMetadata"
        >
          <span v-if="infoCount > 0" class="danx-file-viewer__meta-badge">{{ infoCount }}</span>
        </DanxButton>

        <DanxButton
          v-if="downloadable"
          type="muted"
          size="sm"
          icon="download"
          tooltip="Download"
          @click="onDownload"
        />
      </div>
    </div>

    <!-- Breadcrumb navigation beneath header -->
    <nav v-if="hasParent" class="danx-file-viewer__breadcrumbs" aria-label="File navigation">
      <template v-for="(entry, index) in breadcrumbs" :key="entry.id">
        <span v-if="index > 0" class="danx-file-viewer__breadcrumb-separator">/</span>
        <span
          v-if="index === breadcrumbs.length - 1"
          class="danx-file-viewer__breadcrumb-item danx-file-viewer__breadcrumb-item--active"
          aria-current="step"
          >{{ entry.name }}</span
        >
        <button
          v-else
          class="danx-file-viewer__breadcrumb-item"
          @click="navigateToAncestor(entry.id)"
        >
          {{ entry.name }}
        </button>
      </template>
    </nav>

    <!-- Main content area with optional docked metadata -->
    <div class="danx-file-viewer__body">
      <div class="danx-file-viewer__content">
        <!-- Previous arrow -->
        <button
          v-if="hasPrev"
          class="danx-file-viewer__arrow danx-file-viewer__arrow--prev"
          aria-label="Previous"
          @click="prev"
        >
          <DanxIcon icon="chevron-left" />
        </button>

        <!-- Virtual carousel slides -->
        <div
          v-for="slide in visibleSlides"
          :key="slide.file.id"
          class="danx-file-viewer__slide"
          :class="{ 'danx-file-viewer__slide--active': slide.isActive }"
        >
          <DanxFile
            :file="slide.file"
            :mode="slide.isActive ? 'preview' : 'thumb'"
            size="auto"
            fit="contain"
            disabled
          />
        </div>

        <!-- Next arrow -->
        <button
          v-if="hasNext"
          class="danx-file-viewer__arrow danx-file-viewer__arrow--next"
          aria-label="Next"
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
    <DanxFileThumbnailStrip :files="activeFiles" :active-file-id="currentFile.id" @select="goTo" />
  </div>
</template>
