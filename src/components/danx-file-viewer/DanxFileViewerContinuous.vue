<!--
/**
 * DanxFileViewerContinuous - PDF-style continuous scroll body for DanxFileViewer
 *
 * Renders every file in `files` as a stacked column inside a virtualized
 * scroll container. The active file follows scroll position: as the user
 * scrolls, `activeFileId` updates to the file at the top of the viewport.
 * Clicking a thumbnail or pressing next/prev in the parent updates
 * `activeFileId` from above, which scrolls the column to that file.
 *
 * Built on DanxVirtualScroll so even large file sets render efficiently.
 *
 * Zoom resizes each item directly (no CSS transform): the item width is
 * `${zoom}cqw` (container-query width unit) so 100% fills the viewport,
 * 200% renders twice as wide and overflows horizontally. The item height
 * scales with zoom too, and DanxVirtualScroll's `defaultItemSize` mirrors
 * that height so the scrollbar + virtual window stay accurate.
 *
 * When zoomed beyond viewport width, the underlying DanxScroll viewport
 * gains a horizontal scrollbar. Ctrl/Cmd+drag pans the rendered column via a
 * free CSS transform (the same model as the paged DanxZoomable): the page can
 * be moved anywhere at any zoom — it is NOT clamped to the scroll bounds and
 * never snaps back to center. dblclick resets zoom + pan. Wheel still scrolls
 * between files; the pan transform leaves scrollTop / virtualization untouched.
 *
 * @props
 *   files: PreviewFile[] - Files to render (required)
 *   activeFileId: string - Current active file ID (v-model)
 *   zoom?: number - Zoom percent (v-model, default 100)
 *   zoomable?: boolean - Enable Ctrl+wheel / keyboard zoom + Ctrl+drag pan (default false)
 *   lockZoom?: boolean - Pin zoom: disable Ctrl+wheel / keyboard zoom gestures
 *     while keeping Ctrl+drag pan active (default false)
 *
 * @emits
 *   update:activeFileId(id) - Active file changed via scroll
 *   update:zoom(value) - Zoom percent changed via wheel/key gesture
 *
 * @tokens
 *   --dx-file-continuous-bg - Container background
 *   --dx-file-continuous-item-padding - Padding inside each item
 *   --dx-file-continuous-item-base-height - Base item height (px) before zoom (default 600)
 *   --dx-file-continuous-item-gap - Vertical gap between items (default 0.5rem)
 */
-->

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from "vue";
import { DanxFile } from "../danx-file";
import type { PreviewFile } from "../danx-file";
import DanxVirtualScroll from "../scroll/DanxVirtualScroll.vue";
import { useZoomable } from "../zoomable";

const props = withDefaults(
  defineProps<{
    files: PreviewFile[];
    activeFileId: string;
    zoomable?: boolean;
    lockZoom?: boolean;
    zoomMin?: number;
    zoomMax?: number;
    zoomStep?: number;
  }>(),
  {
    zoomable: false,
    lockZoom: false,
    zoomMin: 25,
    zoomMax: 400,
    zoomStep: 10,
  }
);

const emit = defineEmits<{
  "update:activeFileId": [id: string];
}>();

const zoom = defineModel<number>("zoom", { default: 100 });

const BASE_ITEM_HEIGHT = 600;
// Vertical gap between items, in px. Lives inside each item as padding-bottom
// (with box-sizing: border-box) so DanxVirtualScroll's measureItem reads the
// full per-row height via offsetHeight and the start-index calc stays accurate.
const ITEM_GAP = 8;

const rootRef = ref<HTMLElement | null>(null);
const scrollRef = ref<{ $el: HTMLElement } | null>(null);
const panRef = ref({ x: 0, y: 0 });

// Pan is a free CSS transform on the rendered item column (same model as the
// paged DanxZoomable) — the user can drag the page anywhere at any zoom, not
// just within the scroll bounds. It is enabled whenever `zoomable` is on
// (independent of lockZoom, so a pinned-zoom viewer still pans).
const panDisabled = computed(() => !props.zoomable);
// Zoom gestures fire only when zoomable AND not locked.
const wheelDisabled = computed(() => !props.zoomable || props.lockZoom);
const keyboardDisabled = computed(() => !props.zoomable || props.lockZoom);
const { isDragging, panInputActive, onDragStart, onDblClick } = useZoomable({
  zoom,
  pan: panRef,
  rootRef,
  min: toRef(props, "zoomMin"),
  max: toRef(props, "zoomMax"),
  step: toRef(props, "zoomStep"),
  panDisabled,
  wheelDisabled,
  keyboardDisabled,
});

// Overlay sits above the scrolled content while the modifier key is held so a
// drag pans the whole column instead of selecting / interacting with a file.
const showDragOverlay = computed(() => panInputActive.value && !panDisabled.value);

const zoomScale = computed(() => zoom.value / 100);

// Each item's content height in px (image area only).
const scaledItemHeight = computed(() => Math.round(BASE_ITEM_HEIGHT * zoomScale.value));
// Full per-row box height including the inter-item gap. DanxVirtualScroll
// uses this as `defaultItemSize`; the item itself uses it as its CSS height
// with `box-sizing: border-box` so offsetHeight == this number and
// measureItem's sizeCache stays correct.
const fullItemHeight = computed(() => scaledItemHeight.value + ITEM_GAP);

// Item width drives off a CSS custom property so the cqw unit lives in the
// stylesheet (some test environments strip unknown CSS units from inline
// style attributes). The `--zoom-pct` value resolves to `${zoom}cqw` via
// the item's CSS rule against the continuous root's container query context.
// Pan offset is a free CSS transform applied uniformly to every visible item,
// so the whole column shifts together (matching the paged DanxZoomable) while
// the underlying scrollTop / virtualization stay untouched.
const itemStyle = computed(() => ({
  "--zoom-pct": String(zoom.value),
  height: `${fullItemHeight.value}px`,
  transform: `translate(${panRef.value.x}px, ${panRef.value.y}px)`,
}));

// --- activeFileId ↔ viewport scroll (centered) ------------------------------

let viewportEl: HTMLElement | null = null;

function findViewport(): HTMLElement | null {
  const root = scrollRef.value?.$el;
  return root?.querySelector(".danx-scroll__viewport") ?? null;
}
// We don't use DanxVirtualScroll's scrollPosition v-model (= startIndex = top
// of viewport). The sidebar highlight should follow the file CENTERED in the
// viewport, so we manage scroll position ourselves: a scroll listener finds
// the center file + emits update:activeFileId, and a watch on activeFileId
// scrolls the viewport so that file sits at center.

let lastEmittedId = "";
let suppressOwnScrollEcho = false;

function indexAtCenter(): number {
  viewportEl = findViewport();
  if (!viewportEl) return 0;
  const center = viewportEl.scrollTop + viewportEl.clientHeight / 2;
  const itemH = fullItemHeight.value || 1;
  return Math.min(props.files.length - 1, Math.max(0, Math.floor(center / itemH)));
}

function onViewportScroll() {
  if (suppressOwnScrollEcho) return;
  const idx = indexAtCenter();
  const file = props.files[idx];
  if (!file) return;
  if (file.id === props.activeFileId) return;
  lastEmittedId = file.id;
  emit("update:activeFileId", file.id);
}

function scrollToCenter(idx: number) {
  viewportEl = findViewport();
  if (!viewportEl) return;
  const target =
    idx * fullItemHeight.value + fullItemHeight.value / 2 - viewportEl.clientHeight / 2;
  suppressOwnScrollEcho = true;
  viewportEl.scrollTop = Math.max(0, target);
  requestAnimationFrame(() => {
    suppressOwnScrollEcho = false;
  });
}

watch(
  () => props.activeFileId,
  (id) => {
    if (id === lastEmittedId) {
      lastEmittedId = "";
      return;
    }
    const idx = props.files.findIndex((f) => f.id === id);
    if (idx < 0) return;
    // Navigating to a different page resets the free-pan offset — the previous
    // offset has no meaning against new content.
    panRef.value = { x: 0, y: 0 };
    scrollToCenter(idx);
  }
);

// When files change but activeFileId is no longer in the set, snap to first.
watch(
  () => props.files,
  (next) => {
    if (next.length === 0) return;
    if (!next.find((f) => f.id === props.activeFileId)) {
      emit("update:activeFileId", next[0]!.id);
    }
  }
);

onMounted(async () => {
  // DanxVirtualScroll's inner DanxScroll mounts the viewport on its own
  // onMounted hook (runs in the same tick); wait one nextTick to be safe.
  await nextTick();
  viewportEl = findViewport();
  if (viewportEl) {
    viewportEl.addEventListener("scroll", onViewportScroll, { passive: true });
    // Initial sync: scroll to the currently-active file's center.
    const idx = props.files.findIndex((f) => f.id === props.activeFileId);
    if (idx > 0) scrollToCenter(idx);
  }
});

onBeforeUnmount(() => {
  if (viewportEl) {
    viewportEl.removeEventListener("scroll", onViewportScroll);
  }
});
</script>

<template>
  <div
    ref="rootRef"
    class="danx-file-continuous-root"
    :class="{ 'is-pan-ready': panInputActive && !isDragging, 'is-dragging': isDragging }"
    tabindex="0"
    @mousedown="onDragStart"
    @dblclick="onDblClick"
  >
    <DanxVirtualScroll
      ref="scrollRef"
      :items="files"
      direction="vertical"
      :default-item-size="fullItemHeight"
      :key-fn="(file) => file.id"
      class="danx-file-continuous"
    >
      <template #item="{ item: file }">
        <div class="danx-file-continuous__item" :style="itemStyle">
          <DanxFile :file="file" mode="preview" size="auto" fit="contain" disabled />
        </div>
      </template>
    </DanxVirtualScroll>

    <!-- Drag overlay — sits above the scrolled content while the modifier key
         is held so the drag pans the column instead of interacting with a
         file. Mirrors DanxZoomable's overlay. -->
    <div
      v-if="showDragOverlay"
      class="danx-file-continuous-root__drag-overlay"
      aria-hidden="true"
    />
  </div>
</template>
