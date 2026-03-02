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
 * Metadata is displayed in a resizable split panel beside the file preview,
 * toggled via the info button in the header. Touch/swipe gestures are handled
 * by the `useTouchSwipe` composable for instance-scoped gesture state.
 *
 * @models
 *   fileInPreview: PreviewFile | null - Currently active file (emits on navigation)
 *
 * @props
 *   file: PreviewFile - The main/anchor file (required)
 *   relatedFiles?: PreviewFile[] - Related files for carousel navigation
 *   downloadable?: boolean - Show download button in header
 *   childrenLabel?: string - Label for children nav button (default: "Children")
 *
 * @emits
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
 *   --dx-file-strip-badge-bg - Thumbnail strip badge background
 *   --dx-file-strip-badge-color - Thumbnail strip badge text color
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
import { DanxFile, handleDownload } from "../danx-file";
import type { PreviewFile } from "../danx-file";
import { DanxIcon } from "../icon";
import { DanxSplitPanel } from "../split-panel";
import type { DanxFileViewerEmits, DanxFileViewerProps, DanxFileViewerSlots } from "./types";
import { useDanxFileViewer } from "./useDanxFileViewer";
import { useTouchSwipe } from "../../shared/composables/useTouchSwipe";
import { hasAnyInfo, metaCount, exifCount } from "./file-metadata-helpers";
import { useVirtualCarousel } from "./useVirtualCarousel";
import DanxFileViewerHeader from "./DanxFileViewerHeader.vue";
import DanxFileThumbnailStrip from "./DanxFileThumbnailStrip.vue";
import DanxFileMetadata from "./DanxFileMetadata.vue";

const props = withDefaults(defineProps<DanxFileViewerProps>(), {
  relatedFiles: () => [],
  downloadable: false,
  childrenLabel: "Children",
});

const emit = defineEmits<DanxFileViewerEmits>();

const fileInPreview = defineModel<PreviewFile | null>("fileInPreview", {
  default: null,
});

defineSlots<DanxFileViewerSlots>();

const SPLIT_PANELS = [
  { id: "viewer", label: "Viewer", defaultWidth: 70 },
  { id: "metadata", label: "Info", defaultWidth: 30 },
];

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

const childCount = computed(() => currentFile.value.children?.length ?? 0);

// Metadata state — toggle the split panel's metadata panel
const hasMetadata = computed(() => hasAnyInfo(currentFile.value));
const infoCount = computed(() => metaCount(currentFile.value) + exifCount(currentFile.value));
const metadataEnabled = ref(false);
const activePanels = computed({
  get: () => (metadataEnabled.value && hasMetadata.value ? ["viewer", "metadata"] : ["viewer"]),
  set: (val) => {
    metadataEnabled.value = val.includes("metadata");
  },
});
const showMetadata = computed(() => activePanels.value.includes("metadata"));

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
  metadataEnabled.value = !metadataEnabled.value;
}

function onDownload() {
  handleDownload(currentFile.value, (event) => emit("download", event));
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

const { onTouchStart, onTouchEnd } = useTouchSwipe({
  onSwipeLeft: next,
  onSwipeRight: prev,
});
</script>

<template>
  <div
    class="danx-file-viewer"
    tabindex="0"
    @keydown="onKeydown"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Header + breadcrumbs -->
    <DanxFileViewerHeader
      :file-name="currentFile.name"
      :has-parent="hasParent"
      :has-child-files="hasChildFiles"
      :child-count="childCount"
      :children-label="childrenLabel"
      :slide-label="slideLabel"
      :has-metadata="hasMetadata"
      :info-count="infoCount"
      :downloadable="downloadable"
      :breadcrumbs="breadcrumbs"
      @back-from-child="backFromChild()"
      @dive-into-children="diveIntoChildren()"
      @toggle-metadata="toggleMetadata"
      @download="onDownload"
      @navigate-to-ancestor="navigateToAncestor($event)"
    >
      <template #header-actions>
        <slot name="header-actions" />
      </template>
    </DanxFileViewerHeader>

    <!-- Main content area with optional metadata split panel -->
    <DanxSplitPanel
      v-model="activePanels"
      :panels="SPLIT_PANELS"
      storage-key="danx-file-viewer-meta"
      class="danx-file-viewer__body"
    >
      <template #viewer>
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
        </div>
      </template>

      <template v-if="showMetadata" #metadata>
        <DanxFileMetadata :file="currentFile" />
      </template>
    </DanxSplitPanel>

    <!-- Thumbnail strip -->
    <DanxFileThumbnailStrip :files="activeFiles" :active-file-id="currentFile.id" @select="goTo" />
  </div>
</template>
