<script setup lang="ts">
import { ref } from "vue";
import { DanxFileViewer } from "danx-ui";

const TOTAL_IMAGES = 50;

const mainFile = ref({
  id: "1",
  name: "photo-1.jpg",
  size: 524288,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/carousel1/800/600",
  children: [],
});

const relatedFiles = ref(
  Array.from({ length: TOTAL_IMAGES - 1 }, (_, i) => ({
    id: String(i + 2),
    name: `photo-${i + 2}.jpg`,
    size: 300000 + Math.floor(Math.random() * 300000),
    mime: "image/jpeg",
    url: `https://picsum.photos/seed/carousel${i + 2}/800/600`,
    children: [],
  }))
);

const activeFile = ref(null);
</script>

<template>
  <div class="w-full h-[500px] border border-border rounded-lg overflow-hidden">
    <DanxFileViewer
      :file="mainFile"
      v-model:file-in-preview="activeFile"
      :related-files="relatedFiles"
      downloadable
    />
  </div>
</template>
