<!--
/**
 * DanxFileViewer - Responsive standalone file viewer
 *
 * A responsive file viewer that fills its container. Completely independent
 * from DanxFile. Can be embedded anywhere — in a dialog, sidebar, or page section.
 * Supports image and video preview, navigation between related files,
 * keyboard navigation, and download.
 *
 * Two independent layout toggles compose into four visual modes:
 *   - sidebar off + paged (default) → carousel slide with bottom thumbnail strip.
 *   - sidebar on  + paged           → carousel slide with left-hand vertical strip (PDF reader).
 *   - sidebar off + continuous      → virtualized scrolling column with bottom strip.
 *   - sidebar on  + continuous      → virtualized scrolling column with left-hand strip.
 *
 * Each toggle is an independent boolean — the user picks any combination via
 * the toolbar (a multi-select button group). Carousel uses a virtual buffer
 * (current ±2 slides) with opacity transitions; continuous uses DanxVirtualScroll
 * and the active file follows the scroll position so the header / metadata /
 * thumbnail highlight stay in sync.
 *
 * Photoshop-style zoom + pan is ON BY DEFAULT (`zoomable`, opt out with
 * `:zoomable="false"`). Both modes support Ctrl+wheel zoom, Ctrl+drag free
 * pan, Ctrl+`+`/`-`/`=`/`0` keys, and dblclick reset:
 *   - Paged mode wraps the active slide in `DanxZoomable`.
 *   - Continuous mode scales each rendered item via CSS transform (item
 *     height + virtual-scroll defaultItemSize scale with zoom so the
 *     scrollbar stays accurate) and applies a free CSS-transform pan to the
 *     column — the page moves anywhere at any zoom, not clamped to scroll
 *     bounds. Wheel still scrolls between files.
 * The zoom value is shared, so switching between modes preserves it. The zoom
 * slider toolbar is a SEPARATE opt-in (`zoomControls`, default off) — events
 * work regardless of whether the slider is shown.
 *
 * Two prop families control sidebar / continuous / zoom, with distinct
 * semantics:
 *   - SEED (`defaultSidebar` / `defaultContinuous` / `defaultZoom`): the
 *     starting value when localStorage is empty. The user can then override
 *     via the toolbar, and the choice persists. Reading order:
 *     `localStorage[key] ?? defaultProp ?? built-in default`.
 *   - LOCKED (`sidebar` / `continuous` / `zoom`): when provided, the state is
 *     PINNED to the prop — localStorage is bypassed (no read, no write), the
 *     corresponding toggle button / zoom controls are hidden, and the
 *     `layoutToggles` watcher will not clear it. Reactively follows the prop.
 *
 * Single-file override: when the navigable set (`activeFiles` — file +
 * relatedFiles, or the current children level when dived in) has <= 1 entry,
 * sidebar + continuous are forced OFF and both layout toggles are hidden,
 * overriding the LOCKED props and any localStorage preference (there is
 * nothing to page through or scroll). The toolbar still shows for zoom. This
 * is reactive: diving into a multi-page file's children re-enables them.
 *
 * The metadata split panel widths also persist per sidebar state under the
 * same namespace.
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
 *   defaultSidebar?: boolean - SEED sidebar flag when localStorage empty (default: false)
 *   defaultContinuous?: boolean - SEED continuous-scroll flag when empty (default: false)
 *   defaultZoom?: number - SEED zoom fallback (default: 100)
 *   sidebar?: boolean - LOCKED sidebar state (pins value, bypasses localStorage + toggle)
 *   continuous?: boolean - LOCKED continuous state (pins value, bypasses localStorage + toggle)
 *   zoom?: number - LOCKED zoom percent (pins value, hides zoom controls; pan still works)
 *   layoutToggles?: LayoutToggle[] - Toggles user can flip in the toolbar (default: [])
 *   zoomable?: boolean - Enable zoom + pan events (default: true, opt out with false)
 *   zoomControls?: boolean - Show the zoom slider toolbar (default: false; events work regardless)
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
 *     :layout-toggles="['sidebar', 'continuous']"
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
import type { DanxFileViewerEmits, DanxFileViewerProps, DanxFileViewerSlots } from "./types";
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
  defaultSidebar: false,
  defaultContinuous: false,
  defaultZoom: 100,
  layoutToggles: () => [],
  zoomable: true,
  zoomControls: false,
  storageKey: "danx-file-viewer",
  showToolbar: undefined,
  sidebar: undefined,
  continuous: undefined,
  zoom: undefined,
});

const emit = defineEmits<DanxFileViewerEmits>();

const fileInPreview = defineModel<PreviewFile | null>("fileInPreview", {
  default: null,
});

defineSlots<DanxFileViewerSlots>();

const isBool = (v: unknown): v is boolean => typeof v === "boolean";

// Persisted preferences — read from localStorage with prop fallback. These
// back the SEED + toggle behavior (default-* props). The LOCKED props
// (`sidebar` / `continuous` / `zoom`) bypass these entirely when provided.
const sidebarPref = usePreference<boolean>(props.storageKey, "sidebar", props.defaultSidebar, {
  validate: isBool,
});
const continuousPref = usePreference<boolean>(
  props.storageKey,
  "continuous",
  props.defaultContinuous,
  { validate: isBool }
);
const zoomPref = usePreference<number>(props.storageKey, "zoom", props.defaultZoom, {
  validate: (v): v is number => typeof v === "number" && Number.isFinite(v),
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

// A single navigable file has nothing to scroll through or page between, so
// sidebar + continuous layouts are forced off and their toggles hidden,
// OVERRIDING the authoritative props and any localStorage preference. Reactive
// — diving into a multi-page file's children (or navigating back to a single
// root) flips this live.
const isMultiFile = computed(() => activeFiles.value.length > 1);

// Locked-aware state. When the matching authoritative prop is provided, the
// getter returns the prop (reactively following prop changes) and the setter
// is a no-op — the prop is the single source of truth, localStorage is never
// touched. When the prop is undefined, behavior is identical to today: read /
// write the persisted preference. Either way a single-file set forces the
// layout off (see isMultiFile).
const sidebar = computed<boolean>({
  get: () => isMultiFile.value && (props.sidebar ?? sidebarPref.value),
  set: (v) => {
    if (props.sidebar === undefined) sidebarPref.value = v;
  },
});
const continuous = computed<boolean>({
  get: () => isMultiFile.value && (props.continuous ?? continuousPref.value),
  set: (v) => {
    if (props.continuous === undefined) continuousPref.value = v;
  },
});
const zoom = computed<number>({
  get: () => props.zoom ?? zoomPref.value,
  set: (v) => {
    if (props.zoom === undefined) zoomPref.value = v;
  },
});

// Zoom is locked (pinned) when the authoritative prop is provided.
const zoomLocked = computed(() => props.zoom !== undefined);

// Layout toggles minus any layout the consumer has locked — a locked layout's
// toggle button must not render (the consumer owns that state). With a single
// navigable file both layout toggles are hidden entirely (nothing to toggle).
const effectiveLayoutToggles = computed(() =>
  isMultiFile.value
    ? props.layoutToggles.filter((t) =>
        t === "sidebar" ? props.sidebar === undefined : props.continuous === undefined
      )
    : []
);

// Toolbar zoom slider renders only when explicitly opted in (`zoomControls`),
// zoom events are enabled, AND zoom is not locked. Zoom EVENTS (Ctrl+wheel /
// drag / keys) are independent — they follow `zoomable` (default on).
const zoomControlsEnabled = computed(
  () => props.zoomable && props.zoomControls && props.zoom === undefined
);

// Clamp persisted flags to the consumer's allowed toggle list — a stale
// localStorage value from a previous configuration shouldn't lock the user
// into a mode the consumer has disabled. Skipped for locked layouts (the prop
// owns the value, not the toggle list).
watch(
  () => props.layoutToggles,
  (allowed) => {
    if (props.sidebar === undefined && sidebar.value && !allowed.includes("sidebar")) {
      sidebar.value = false;
    }
    if (props.continuous === undefined && continuous.value && !allowed.includes("continuous")) {
      continuous.value = false;
    }
  },
  { immediate: true }
);

const showToolbar = computed(() => {
  if (typeof props.showToolbar === "boolean") return props.showToolbar;
  return effectiveLayoutToggles.value.length > 0 || zoomControlsEnabled.value;
});

// Distinct identity per layout combination — drives the :key on
// DanxSplitPanel so the split-panel state remounts cleanly when the user
// flips sidebar / continuous (different panel set + storage key).
const layoutId = computed(() => `${sidebar.value ? "s" : "-"}${continuous.value ? "c" : "-"}`);

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

// Outer split panel reconfigures based on whether the sidebar is enabled.
// Sidebar off → original two-panel [viewer, metadata]. Sidebar on → adds a
// thumbnail strip panel on the left.
const PANELS_NO_SIDEBAR: SplitPanelConfig[] = [
  { id: "viewer", label: "Viewer", defaultWidth: 70 },
  { id: "metadata", label: "Info", defaultWidth: 30 },
];
const PANELS_WITH_SIDEBAR: SplitPanelConfig[] = [
  { id: "strip", label: "Pages", defaultWidth: 18 },
  { id: "viewer", label: "Viewer", defaultWidth: 52 },
  { id: "metadata", label: "Info", defaultWidth: 30 },
];

const panelsForLayout = computed(() => (sidebar.value ? PANELS_WITH_SIDEBAR : PANELS_NO_SIDEBAR));
const panelsStorageKey = computed(
  () => `${props.storageKey}-panels-${sidebar.value ? "sidebar" : "default"}`
);

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

// Zoom + pan models. In paged mode the active slide gets a DanxZoomable
// wrapper (full pan + zoom). In continuous mode the body component handles
// zoom via item-level CSS scale + Ctrl+wheel/keyboard listeners; pan is
// inactive (native scroll owns vertical movement).
const pan = ref<Pan>({ x: 0, y: 0 });
const isPagedZoomActive = computed(() => props.zoomable && !continuous.value);
const isContinuousZoomActive = computed(() => props.zoomable && continuous.value);

// Reset pan when the active file or any layout toggle changes — different
// content geometry means the previous offset no longer makes sense.
watch([currentFile, sidebar, continuous], () => {
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
  if (continuous.value) return; // scroll handles navigation
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  }
}

// --- Touch/swipe gestures ---

// Precedence vs DanxZoomable's own touch handling: two-finger gestures are
// always claimed by DanxZoomable via stopPropagation (pinch/pan territory),
// so they never reach these listeners. One-finger swipe-to-navigate is only
// meaningful when not zoomed in — otherwise a one-finger drag is panning the
// zoomed content, not paging — so gate on zoom === 100 here.
const { onTouchStart, onTouchEnd } = useTouchSwipe({
  onSwipeLeft: () => {
    if (!continuous.value && zoom.value === 100) next();
  },
  onSwipeRight: () => {
    if (!continuous.value && zoom.value === 100) prev();
  },
});
</script>

<template>
  <div
    class="danx-file-viewer"
    :class="[
      sidebar ? 'danx-file-viewer--sidebar' : 'danx-file-viewer--no-sidebar',
      continuous ? 'danx-file-viewer--continuous' : 'danx-file-viewer--paged',
    ]"
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

    <!-- Optional toolbar (layout toggles + zoom controls). Auto-shows when any
         control is opted in; consumer can force on/off via showToolbar. -->
    <DanxFileViewerToolbar
      v-if="showToolbar"
      v-model:sidebar="sidebar"
      v-model:continuous="continuous"
      v-model:zoom="zoom"
      :layout-toggles="effectiveLayoutToggles"
      :zoomable="zoomControlsEnabled"
    />

    <!-- Main content area with optional metadata + (sidebar mode) thumbnail
         strip split panels. -->
    <DanxSplitPanel
      :key="layoutId"
      v-model="activePanels"
      :panels="panelsForLayout"
      :storage-key="panelsStorageKey"
      class="danx-file-viewer__body"
    >
      <template v-if="sidebar" #strip>
        <DanxFileThumbnailStrip
          :files="activeFiles"
          :active-file-id="currentFile.id"
          orientation="vertical"
          @select="goTo"
        />
      </template>

      <template #viewer>
        <div class="danx-file-viewer__content">
          <template v-if="continuous">
            <DanxFileViewerContinuous
              v-model:zoom="zoom"
              :files="activeFiles"
              :active-file-id="currentFile.id"
              :zoomable="isContinuousZoomActive"
              :lock-zoom="zoomLocked"
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
                v-if="isPagedZoomActive && slide.isActive"
                v-model:zoom="zoom"
                v-model:pan="pan"
                :wheel-disabled="zoomLocked"
                :keyboard-disabled="zoomLocked"
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

    <!-- Bottom thumbnail strip — only when sidebar is off. Sidebar mode
         renders the strip inside the split panel as a left column. -->
    <DanxFileThumbnailStrip
      v-if="!sidebar"
      :files="activeFiles"
      :active-file-id="currentFile.id"
      @select="goTo"
    />
  </div>
</template>
