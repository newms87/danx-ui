<!--
/**
 * DanxFileThumbnailStrip - Scrollable horizontal thumbnail row
 *
 * Internal subcomponent of DanxFileNavigator. Renders a horizontal strip
 * of file thumbnails with the active file highlighted. Auto-scrolls to
 * keep the active thumbnail visible. Only renders for 2+ files.
 * Inactive thumbnails have reduced opacity; the active thumbnail scales up.
 * Index badges appear on thumbnails when there are 3+ files.
 *
 * Uses raw <img> elements for performance (avoids DanxFile overhead).
 * Falls back to a document icon when no thumbnail URL is available.
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
import { computed, ref, watch, nextTick } from "vue";
import { DanxIcon } from "../icon";
import { DanxScroll } from "../scroll";
import { resolveThumbUrl, isImage, isVideo } from "../danx-file/file-helpers";
import type { PreviewFile } from "../danx-file/types";

const props = defineProps<{
  files: PreviewFile[];
  activeFileId: string;
}>();

const emit = defineEmits<{
  select: [file: PreviewFile];
}>();

const showBadges = computed(() => props.files.length >= 3);
const stripRef = ref<HTMLElement | null>(null);

/**
 * Determine if a file has a displayable thumbnail URL.
 * Only image and video files have meaningful thumbnails.
 */
function hasThumbUrl(file: PreviewFile): boolean {
  if (isImage(file)) return !!resolveThumbUrl(file);
  // For video files, only use actual thumb/optimized URLs — not the raw video URL
  if (isVideo(file)) return !!(file.thumb?.url || file.optimized?.url);
  return false;
}

// Auto-scroll to active thumbnail
watch(
  () => props.activeFileId,
  async () => {
    await nextTick();
    if (!stripRef.value) return;
    const active = stripRef.value.querySelector(".danx-file-strip__thumb--active");
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }
);
</script>

<template>
  <DanxScroll v-if="files.length >= 2" direction="horizontal" size="xs" class="danx-file-strip">
    <div ref="stripRef" class="danx-file-strip__inner">
      <div
        v-for="(file, index) in files"
        :key="file.id"
        class="danx-file-strip__thumb"
        :class="{ 'danx-file-strip__thumb--active': file.id === activeFileId }"
        @click="emit('select', file)"
      >
        <img
          v-if="hasThumbUrl(file)"
          class="danx-file-strip__img"
          :src="resolveThumbUrl(file)"
          :alt="file.name"
          loading="lazy"
        />
        <DanxIcon v-else icon="document" class="danx-file-strip__fallback-icon" />
        <span v-if="showBadges" class="danx-file-strip__badge">{{ index + 1 }}</span>
      </div>
    </div>
  </DanxScroll>
</template>
