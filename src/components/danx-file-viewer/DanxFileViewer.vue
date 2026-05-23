<!--
/**
 * DanxFileViewer - Responsive standalone file viewer
 *
 * A responsive file viewer that fills its container. Completely independent
 * from DanxFile. Can be embedded anywhere — in a dialog, sidebar, or page section.
 * Supports image and video preview, navigation between related files,
 * keyboard navigation, and download.
 *
 * Three layout modes are supported (all opt-in via props):
 *   - `horizontal` (default) — single active slide with a thumbnail strip beneath.
 *     Uses a virtual carousel that renders current ±2 slides with opacity
 *     transitions for smooth navigation.
 *   - `vertical` — single active slide with a tall thumbnail column on the left
 *     (PDF-style sidebar). Widths resize via DanxSplitPanel.
 *   - `continuous` — every file rendered as a stacked column inside a
 *     virtualized scroll container. The active file follows the scroll position
 *     so the header / metadata / thumbnail highlight update live.
 *
 * Photoshop-style zoom + pan can be enabled via `zoomable`: the active slide
 * is wrapped in a `DanxZoomable` that responds to Ctrl+wheel, Ctrl+drag,
 * Ctrl+`+`/`-`/`=`/`0`, and dblclick reset. Continuous mode disables zoom
 * (scroll is the primary gesture there).
 *
 * Both `layout` and `zoom` persist to localStorage under `storageKey`. Reading
 * order: `localStorage[key] ?? defaultProp ?? built-in default`. The metadata
 * split panel widths also persist (per layout) under the same namespace.
 *
 * Metadata is displayed in a resizable split panel beside the file preview,
 * toggled via the info button in the header. Touch/swipe gestures are handled
 * by the `useTouchSwipe` composable.
 *
 * @models
 *   fileInPreview: PreviewFile | null - Currently active file (emits on navigation)
 *
 * @props
 *   file: PreviewFile - The main/anchor file (required)
 *   relatedFiles?: PreviewFile[] - Related files for carousel navigation
 *   downloadable?: boolean - Show download button in header
 *   childrenLabel?: string - Label for children nav button (default: "Children")
 *   defaultLayout?: Layout - Layout fallback when localStorage is empty (default: "horizontal")
 *   defaultZoom?: number - Zoom fallback (default: 100)
 *   availableLayouts?: Layout[] - Layouts available in toolbar toggle (default: ["horizontal"])
 *   zoomable?: boolean - Enable zoom + pan (default: false)
 *   storageKey?: string - localStorage namespace (default: "danx-file-viewer")
 *   showToolbar?: boolean - Override auto-show toolbar (default: true when controls opted in)
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
 *   --dx-file-strip-thumb-size - Thumbnail strip thumb size (horizontal)
 *   --dx-file-strip-thumb-size-vertical - Thumbnail thumb size (vertical layout)
 *   --dx-file-strip-active-border - Active thumbnail border
 *   --dx-file-strip-bg - Strip background
 *   --dx-file-strip-inactive-opacity - Inactive thumbnail opacity
 *   --dx-file-strip-active-scale - Active thumbnail scale transform
 *   --dx-file-strip-badge-bg - Thumbnail strip badge background
 *   --dx-file-strip-badge-color - Thumbnail strip badge text color
 *   --dx-file-continuous-bg - Continuous body background
 *   --dx-file-continuous-item-padding - Padding around each rendered file in continuous mode
 *   --dx-file-continuous-item-min-height - Minimum item height in continuous mode
 *
 * @example
 *   <DanxFileViewer
 *     :file="mainFile"
 *     v-model:file-in-preview="activeFile"
 *     :related-files="relatedFiles"
 *     :available-layouts="['horizontal', 'vertical', 'continuous']"
 *     zoomable
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
import type { SplitPanelConfig } from "../split-panel";
import { DanxZoomable } from "../zoomable";
import type { Pan } from "../zoomable";
import type {
  DanxFileViewerEmits,
  DanxFileViewerProps,
  DanxFileViewerSlots,
  Layout,
} from "./types";
import { useDanxFileViewer } from "./useDanxFileViewer";
import { useTouchSwipe } from "../../shared/composables/useTouchSwipe";
import { hasAnyInfo, metaCount, exifCount } from "./file-metadata-helpers";
import { useVirtualCarousel } from "./useVirtualCarousel";
import { usePreference } from "./useViewerPreferences";
import DanxFileViewerHeader from "./DanxFileViewerHeader.vue";
import DanxFileViewerToolbar from "./DanxFileViewerToolbar.vue";
import DanxFileThumbnailStrip from "./DanxFileThumbnailStrip.vue";
import DanxFileMetadata from "./DanxFileMetadata.vue";
import DanxFileViewerContinuous from "./DanxFileViewerContinuous.vue";

const props = withDefaults(defineProps<DanxFileViewerProps>(), {
  relatedFiles: () => [],
  downloadable: false,
  childrenLabel: "Children",
  defaultLayout: "horizontal",
  defaultZoom: 100,
  availableLayouts: () => ["horizontal"],
  zoomable: false,
  storageKey: "danx-file-viewer",
  showToolbar: undefined,
});

const emit = defineEmits<DanxFileViewerEmits>();

const fileInPreview = defineModel<PreviewFile | null>("fileInPreview", {
  default: null,
});

defineSlots<DanxFileViewerSlots>();

const VALID_LAYOUTS: Layout[] = ["horizontal", "vertical", "continuous"];
const isLayout = (v: unknown): v is Layout =>
  typeof v === "string" && (VALID_LAYOUTS as string[]).includes(v);

// Persisted preferences — read from localStorage with prop fallback.
const layout = usePreference<Layout>(props.storageKey, "layout", props.defaultLayout, {
  validate: isLayout,
});
const zoom = usePreference<number>(props.storageKey, "zoom", props.defaultZoom, {
  validate: (v): v is number => typeof v === "number" && Number.isFinite(v),
});

// Clamp persisted layout into the consumer's available list — a stale
// localStorage value from a previous configuration shouldn't lock the user
// into an unsupported mode.
watch(
  () => props.availableLayouts,
  (avail) => {
    if (!avail.includes(layout.value)) {
      layout.value = avail[0] ?? "horizontal";
    }
  },
  { immediate: true }
);

const showToolbar = computed(() => {
  if (typeof props.showToolbar === "boolean") return props.showToolbar;
  return props.availableLayouts.length > 1 || props.zoomable;
});

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

// Outer split panel reconfigures per layout. The horizontal mode keeps the
// original two-panel [viewer, metadata] layout; vertical / continuous add a
// thumbnail strip panel on the left.
const SPLIT_PANEL_CONFIG: Record<Layout, SplitPanelConfig[]> = {
  horizontal: [
    { id: "viewer", label: "Viewer", defaultWidth: 70 },
    { id: "metadata", label: "Info", defaultWidth: 30 },
  ],
  vertical: [
    { id: "strip", label: "Pages", defaultWidth: 18 },
    { id: "viewer", label: "Viewer", defaultWidth: 52 },
    { id: "metadata", label: "Info", defaultWidth: 30 },
  ],
  continuous: [
    { id: "strip", label: "Pages", defaultWidth: 18 },
    { id: "viewer", label: "Viewer", defaultWidth: 52 },
    { id: "metadata", label: "Info", defaultWidth: 30 },
  ],
};

const panelsForLayout = computed(() => SPLIT_PANEL_CONFIG[layout.value]);
const panelsStorageKey = computed(() => `${props.storageKey}-panels-${layout.value}`);

const activePanels = computed({
  get: () => {
    const base = panelsForLayout.value.map((p) => p.id).filter((id) => id !== "metadata");
    if (metadataEnabled.value && hasMetadata.value) base.push("metadata");
    return base;
  },
  set: (val) => {
    metadataEnabled.value = val.includes("metadata");
  },
});
const showMetadata = computed(() => activePanels.value.includes("metadata"));

// Zoom + pan models. Continuous mode disables the wrapper (scroll = pan); zoom
// value is still preserved so switching back to a slide-based layout restores it.
const pan = ref<Pan>({ x: 0, y: 0 });
const isZoomActive = computed(() => props.zoomable && layout.value !== "continuous");

// Reset pan when the active file changes or layout changes — different
// content geometry means the previous offset no longer makes sense.
watch([currentFile, layout], () => {
  pan.value = { x: 0, y: 0 };
});

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

function onContinuousActiveChange(id: string) {
  const file = activeFiles.value.find((f) => f.id === id);
  if (file && file.id !== currentFile.value.id) {
    goTo(file);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (layout.value === "continuous") return; // scroll handles navigation
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
  onSwipeLeft: () => {
    if (layout.value !== "continuous") next();
  },
  onSwipeRight: () => {
    if (layout.value !== "continuous") prev();
  },
});
</script>

<template>
  <div
    class="danx-file-viewer"
    :class="`danx-file-viewer--${layout}`"
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

    <!-- Optional toolbar (layout toggle + zoom controls). Auto-shows when any
         control is opted in; consumer can force on/off via showToolbar. -->
    <DanxFileViewerToolbar
      v-if="showToolbar"
      v-model:layout="layout"
      v-model:zoom="zoom"
      :available-layouts="availableLayouts"
      :zoomable="zoomable && layout !== 'continuous'"
    />

    <!-- Main content area with optional metadata + (for vertical/continuous)
         thumbnail strip split panels. -->
    <DanxSplitPanel
      :key="layout"
      v-model="activePanels"
      :panels="panelsForLayout"
      :storage-key="panelsStorageKey"
      class="danx-file-viewer__body"
    >
      <template v-if="layout !== 'horizontal'" #strip>
        <DanxFileThumbnailStrip
          :files="activeFiles"
          :active-file-id="currentFile.id"
          orientation="vertical"
          @select="goTo"
        />
      </template>

      <template #viewer>
        <div class="danx-file-viewer__content">
          <template v-if="layout === 'continuous'">
            <DanxFileViewerContinuous
              :files="activeFiles"
              :active-file-id="currentFile.id"
              @update:active-file-id="onContinuousActiveChange"
            />
          </template>
          <template v-else>
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
              <DanxZoomable
                v-if="isZoomActive && slide.isActive"
                v-model:zoom="zoom"
                v-model:pan="pan"
                class="danx-file-viewer__zoom"
              >
                <DanxFile :file="slide.file" mode="preview" size="auto" fit="contain" disabled />
              </DanxZoomable>
              <DanxFile
                v-else
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
          </template>
        </div>
      </template>

      <template v-if="showMetadata" #metadata>
        <DanxFileMetadata :file="currentFile" />
      </template>
    </DanxSplitPanel>

    <!-- Bottom thumbnail strip — only in horizontal layout. Vertical/continuous
         render the strip inside the split panel as a sidebar. -->
    <DanxFileThumbnailStrip
      v-if="layout === 'horizontal'"
      :files="activeFiles"
      :active-file-id="currentFile.id"
      @select="goTo"
    />
  </div>
</template>
