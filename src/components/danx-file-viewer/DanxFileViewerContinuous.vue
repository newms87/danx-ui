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
 * gains a horizontal scrollbar. Ctrl/Cmd+drag on the root pans (scrolls
 * the viewport in both axes) so the user can move large pages around.
 *
 * @props
 *   files: PreviewFile[] - Files to render (required)
 *   activeFileId: string - Current active file ID (v-model)
 *   zoom?: number - Zoom percent (v-model, default 100)
 *   zoomable?: boolean - Enable Ctrl+wheel / keyboard zoom + Ctrl+drag pan (default false)
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
import { computed, onBeforeUnmount, onMounted, ref, toRef, watch } from "vue";
import { DanxFile } from "../danx-file";
import type { PreviewFile } from "../danx-file";
import { DanxVirtualScroll } from "../scroll";
import { useZoomable } from "../zoomable";

const props = withDefaults(
  defineProps<{
    files: PreviewFile[];
    activeFileId: string;
    zoomable?: boolean;
    zoomMin?: number;
    zoomMax?: number;
    zoomStep?: number;
  }>(),
  {
    zoomable: false,
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

const rootRef = ref<HTMLElement | null>(null);
const scrollRef = ref<{ $el: HTMLElement } | null>(null);
const panRef = ref({ x: 0, y: 0 });

// Pan disabled in useZoomable — we own the drag handler so we can move the
// scroll viewport's scrollLeft / scrollTop directly (instead of CSS translating
// the content, which would fight the virtual scroller).
const panDisabledRef = ref(true);
const wheelDisabled = computed(() => !props.zoomable);
const keyboardDisabled = computed(() => !props.zoomable);
useZoomable({
  zoom,
  pan: panRef,
  rootRef,
  min: toRef(props, "zoomMin"),
  max: toRef(props, "zoomMax"),
  step: toRef(props, "zoomStep"),
  panDisabled: panDisabledRef,
  wheelDisabled,
  keyboardDisabled,
});

const zoomScale = computed(() => zoom.value / 100);

// Each item's box height in px — DanxVirtualScroll uses this for both
// item layout (min-height) AND its windowed defaultItemSize so the scrollbar
// stays proportional as the user zooms.
const scaledItemHeight = computed(() => Math.round(BASE_ITEM_HEIGHT * zoomScale.value));

// Item width drives off a CSS custom property so the cqw unit lives in the
// stylesheet (some test environments strip unknown CSS units from inline
// style attributes). The `--zoom-pct` value resolves to `${zoom}cqw` via
// the item's CSS rule against the continuous root's container query context.
const itemStyle = computed(() => ({
  "--zoom-pct": String(zoom.value),
  height: `${scaledItemHeight.value}px`,
}));

// --- Ctrl/Cmd + drag → pan the scroll viewport in both axes -------------------

let viewportEl: HTMLElement | null = null;
const isDragging = ref(false);
let dragStartX = 0;
let dragStartY = 0;
let dragOriginScrollLeft = 0;
let dragOriginScrollTop = 0;

function findViewport(): HTMLElement | null {
  const root = scrollRef.value?.$el;
  return root?.querySelector(".danx-scroll__viewport") ?? null;
}

function onMouseDown(event: MouseEvent) {
  if (!props.zoomable) return;
  if (event.button !== 0) return;
  if (!(event.ctrlKey || event.metaKey)) return;
  if (!viewportEl) viewportEl = findViewport();
  if (!viewportEl) return;
  event.preventDefault();
  isDragging.value = true;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragOriginScrollLeft = viewportEl.scrollLeft;
  dragOriginScrollTop = viewportEl.scrollTop;
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp, { once: true });
}

function onMouseMove(event: MouseEvent) {
  if (!isDragging.value || !viewportEl) return;
  viewportEl.scrollLeft = dragOriginScrollLeft - (event.clientX - dragStartX);
  viewportEl.scrollTop = dragOriginScrollTop - (event.clientY - dragStartY);
}

function onMouseUp() {
  isDragging.value = false;
  window.removeEventListener("mousemove", onMouseMove);
}

onMounted(() => {
  // viewportEl is queried lazily on first drag — DanxVirtualScroll mounts
  // its inner DanxScroll after this hook fires, so we can't read it here.
});
onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMouseMove);
});

// --- scrollPosition ↔ activeFileId ------------------------------------------

const scrollPosition = computed<number>({
  get() {
    const idx = props.files.findIndex((f) => f.id === props.activeFileId);
    return idx === -1 ? 0 : idx;
  },
  set(idx: number) {
    const file = props.files[idx];
    if (file && file.id !== props.activeFileId) {
      emit("update:activeFileId", file.id);
    }
  },
});

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
</script>

<template>
  <div
    ref="rootRef"
    class="danx-file-continuous-root"
    :class="{ 'is-pan-ready': zoomable, 'is-dragging': isDragging }"
    tabindex="0"
    @mousedown="onMouseDown"
  >
    <DanxVirtualScroll
      ref="scrollRef"
      v-model:scroll-position="scrollPosition"
      :items="files"
      direction="vertical"
      :default-item-size="scaledItemHeight"
      :key-fn="(file) => file.id"
      class="danx-file-continuous"
    >
      <template #item="{ item: file }">
        <div class="danx-file-continuous__item" :style="itemStyle">
          <DanxFile :file="file" mode="preview" size="auto" fit="contain" disabled />
        </div>
      </template>
    </DanxVirtualScroll>
  </div>
</template>
