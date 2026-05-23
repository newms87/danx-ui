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
 * Zoom is supported by scaling each rendered item (not the scroll container)
 * so virtualization stays accurate. The item min-height and `transform: scale()`
 * both derive from `zoom`, and DanxVirtualScroll's `defaultItemSize` scales
 * proportionally so the scrollbar stays correctly sized as the user zooms.
 * Ctrl+wheel / Ctrl+`+`/`-`/`=`/`0` zoom gestures are wired via useZoomable
 * with pan disabled (native scroll is the primary gesture).
 *
 * @props
 *   files: PreviewFile[] - Files to render (required)
 *   activeFileId: string - Current active file ID (v-model)
 *   zoom?: number - Zoom percent (v-model, default 100). When omitted, items render at 100%.
 *   zoomable?: boolean - Enable Ctrl+wheel / keyboard zoom gestures (default false)
 *
 * @emits
 *   update:activeFileId(id) - Active file changed via scroll
 *   update:zoom(value) - Zoom percent changed via wheel/key gesture
 *
 * @tokens
 *   --dx-file-continuous-bg - Container background
 *   --dx-file-continuous-item-padding - Padding inside each item
 *   --dx-file-continuous-item-base-height - Base item height (px) before zoom (default 600)
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
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
const panRef = ref({ x: 0, y: 0 });

// Gesture wiring. Pan disabled — native vertical scroll handles position.
// Ctrl+wheel / keyboard fire even while the scroll container has focus
// because useZoomable scopes its window-keydown listener to rootRef.
const panDisabled = ref(true);
const wheelDisabled = computed(() => !props.zoomable);
const keyboardDisabled = computed(() => !props.zoomable);
useZoomable({
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

const zoomScale = computed(() => zoom.value / 100);

// Per-item height scales linearly with zoom. DanxVirtualScroll uses this as
// its `defaultItemSize` so the scrollbar + windowed range remain correct.
const scaledItemHeight = computed(() => Math.round(BASE_ITEM_HEIGHT * zoomScale.value));

const itemStyle = computed(() => ({
  minHeight: `${scaledItemHeight.value}px`,
}));

const innerStyle = computed(() => ({
  transform: `scale(${zoomScale.value})`,
  transformOrigin: "top center",
  width: "100%",
}));

// scrollPosition = first-visible-item index. Bidirectional with activeFileId.
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
  <div ref="rootRef" class="danx-file-continuous-root" tabindex="0">
    <DanxVirtualScroll
      v-model:scroll-position="scrollPosition"
      :items="files"
      direction="vertical"
      :default-item-size="scaledItemHeight"
      :key-fn="(file) => file.id"
      class="danx-file-continuous"
    >
      <template #item="{ item: file }">
        <div class="danx-file-continuous__item" :style="itemStyle">
          <div class="danx-file-continuous__inner" :style="innerStyle">
            <DanxFile :file="file" mode="preview" size="auto" fit="contain" disabled />
          </div>
        </div>
      </template>
    </DanxVirtualScroll>
  </div>
</template>
