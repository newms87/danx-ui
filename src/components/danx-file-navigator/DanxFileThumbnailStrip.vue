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
import { DanxFile } from "../danx-file";
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
  <div v-if="files.length >= 2" ref="stripRef" class="danx-file-strip">
    <div
      v-for="(file, index) in files"
      :key="file.id"
      class="danx-file-strip__thumb"
      :class="{ 'danx-file-strip__thumb--active': file.id === activeFileId }"
      @click="emit('select', file)"
    >
      <DanxFile :file="file" fit="cover" disabled />
      <span v-if="showBadges" class="danx-file-strip__badge">{{ index + 1 }}</span>
    </div>
  </div>
</template>
