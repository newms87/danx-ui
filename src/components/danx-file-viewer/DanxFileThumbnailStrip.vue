<!--
/**
 * DanxFileThumbnailStrip - Virtualized horizontal thumbnail row
 *
 * Internal subcomponent of DanxFileViewer. Renders a horizontal strip
 * of file thumbnails using DanxVirtualScroll for efficient rendering
 * of large file sets. The active file is highlighted with a border and
 * scale transform. Auto-scrolls to keep the active thumbnail visible.
 * Only renders for 2+ files.
 * Index badges appear on thumbnails when there are 3+ files.
 *
 * Uses DanxFile in thumb mode for consistent rendering.
 * Falls back to a file-type icon when no thumbnail URL is available.
 *
 * @props
 *   files: PreviewFile[] - Files to display as thumbnails
 *   activeFileId: string - ID of the currently active file
 *
 * @emits
 *   select(file) - Thumbnail clicked
 *
 * @tokens
 *   --dx-file-strip-gap - Gap between thumbnails
 *   --dx-file-strip-thumb-size - Thumbnail width and height
 *   --dx-file-strip-active-border - Border for the active thumbnail
 *   --dx-file-strip-bg - Strip background color
 *   --dx-file-strip-inactive-opacity - Inactive thumbnail opacity
 *   --dx-file-strip-active-scale - Active thumbnail scale transform
 */
-->

<script setup lang="ts">
import { type ComponentPublicInstance, computed, nextTick, ref, watch } from "vue";
import { DanxFile, fileDisplayNumber } from "../danx-file";
import type { PreviewFile } from "../danx-file";
import { DanxVirtualScroll } from "../scroll";

const props = defineProps<{
  files: PreviewFile[];
  activeFileId: string;
}>();

const emit = defineEmits<{
  select: [file: PreviewFile];
}>();

const virtualScrollRef = ref<ComponentPublicInstance | null>(null);

const showBadges = computed(() => props.files.length >= 3);

// Auto-scroll to keep active thumbnail visible. Uses scrollIntoView with
// inline: "nearest" so it only scrolls when the thumb is out of viewport
// and moves the minimum distance needed.
watch(
  () => props.activeFileId,
  async () => {
    if (!virtualScrollRef.value?.$el) return;
    // Wait for DanxVirtualScroll to render the item at the new position
    await nextTick();
    if (!virtualScrollRef.value?.$el) return;
    const thumb = virtualScrollRef.value.$el.querySelector(
      `.danx-file-strip__thumb--active`
    ) as HTMLElement | null;
    if (thumb) {
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }
);
</script>

<template>
  <DanxVirtualScroll
    v-if="files.length >= 2"
    ref="virtualScrollRef"
    :items="files"
    direction="horizontal"
    :default-item-size="80"
    :key-fn="(file) => file.id"
    size="lg"
    class="danx-file-strip"
  >
    <template #item="{ item: file, index }">
      <div
        class="danx-file-strip__thumb"
        :class="{ 'danx-file-strip__thumb--active': file.id === activeFileId }"
        @click="emit('select', file)"
      >
        <DanxFile :file="file" size="auto" fit="cover" disabled />
        <span v-if="showBadges" class="danx-file-strip__badge">{{
          fileDisplayNumber(file, index)
        }}</span>
      </div>
    </template>
  </DanxVirtualScroll>
</template>
