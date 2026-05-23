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
 * @props
 *   files: PreviewFile[] - Files to render in the scroll column (required)
 *   activeFileId: string - ID of the active file (v-model)
 *
 * @emits
 *   update:activeFileId(id) - Active file changed via scroll
 *
 * @tokens
 *   --dx-file-continuous-bg - Container background (default: --dx-file-nav-bg)
 *   --dx-file-continuous-item-padding - Vertical padding between items
 *   --dx-file-continuous-item-min-height - Minimum slide height (px)
 */
-->

<script setup lang="ts">
import { computed, watch } from "vue";
import { DanxFile } from "../danx-file";
import type { PreviewFile } from "../danx-file";
import { DanxVirtualScroll } from "../scroll";

const props = defineProps<{
  files: PreviewFile[];
  activeFileId: string;
}>();

const emit = defineEmits<{
  "update:activeFileId": [id: string];
}>();

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
  <DanxVirtualScroll
    v-model:scroll-position="scrollPosition"
    :items="files"
    direction="vertical"
    :default-item-size="600"
    :key-fn="(file) => file.id"
    class="danx-file-continuous"
  >
    <template #item="{ item: file }">
      <div class="danx-file-continuous__item">
        <DanxFile :file="file" mode="preview" size="auto" fit="contain" disabled />
      </div>
    </template>
  </DanxVirtualScroll>
</template>
