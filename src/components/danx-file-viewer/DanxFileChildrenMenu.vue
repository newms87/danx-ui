<!--
/**
 * DanxFileChildrenMenu - Children list popover
 *
 * Internal subcomponent of DanxFileViewer. Shows a popover listing
 * a file's children (transcodes, PDF pages, etc.). Emits loadChildren
 * if children have not been loaded yet.
 *
 * @props
 *   file: PreviewFile - File whose children to display
 *
 * @emits
 *   select(child) - A child was clicked
 *   loadChildren(file) - Children need to be loaded
 *
 * @tokens
 *   --dx-file-children-bg - Menu background
 *   --dx-file-children-thumb-size - Thumbnail size in the list
 */
-->

<script setup lang="ts">
import { computed, watch } from "vue";
import { DanxButton } from "../button";
import { DanxPopover } from "../popover";
import { DanxScroll } from "../scroll";
import { DanxSkeleton } from "../skeleton";
import { DanxFile } from "../danx-file";
import { hasChildren } from "../danx-file/file-helpers";
import type { PreviewFile } from "../danx-file/types";

const props = defineProps<{
  file: PreviewFile;
}>();

const emit = defineEmits<{
  select: [child: PreviewFile];
  loadChildren: [file: PreviewFile];
}>();

const showChildren = computed(() => hasChildren(props.file));

// Emit loadChildren if file has no children loaded
watch(
  () => props.file,
  (f) => {
    if (!f.children) {
      emit("loadChildren", f);
    }
  },
  { immediate: true }
);
</script>

<template>
  <DanxPopover v-if="showChildren || !file.children" placement="bottom">
    <template #trigger>
      <DanxButton type="muted" size="sm" icon="list" title="Children" />
    </template>

    <DanxScroll class="danx-file-children" size="xs">
      <div v-if="!file.children" class="danx-file-children__loading" aria-label="Loading children">
        <div v-for="n in 3" :key="n" class="danx-file-children__skeleton-row">
          <DanxSkeleton
            shape="rounded"
            style="
              --dx-skeleton-width: var(--dx-file-children-thumb-size);
              --dx-skeleton-height: var(--dx-file-children-thumb-size);
            "
          />
          <DanxSkeleton
            shape="rounded"
            style="--dx-skeleton-height: 0.75rem; --dx-skeleton-width: 70%"
          />
        </div>
      </div>
      <div
        v-for="child in file.children"
        :key="child.id"
        class="danx-file-children__item"
        @click="emit('select', child)"
      >
        <div class="danx-file-children__thumb">
          <DanxFile :file="child" fit="cover" disabled />
        </div>
        <span class="danx-file-children__name">{{ child.name }}</span>
      </div>
    </DanxScroll>
  </DanxPopover>
</template>
