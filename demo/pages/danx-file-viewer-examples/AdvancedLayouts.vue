<script setup>
import { ref } from "vue";
import { DanxFileViewer } from "danx-ui";

const TOTAL = 12;

const mainFile = ref({
  id: "1",
  name: "page-1.jpg",
  size: 524288,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/pdf1/800/1100",
  children: [],
});

const relatedFiles = ref(
  Array.from({ length: TOTAL - 1 }, (_, i) => ({
    id: String(i + 2),
    name: `page-${i + 2}.jpg`,
    size: 300000 + Math.floor(Math.random() * 300000),
    mime: "image/jpeg",
    url: `https://picsum.photos/seed/pdf${i + 2}/800/1100`,
    children: [],
  }))
);

const activeFile = ref(null);
</script>

<template>
  <div class="w-full h-[640px] border border-border rounded-lg overflow-hidden">
    <DanxFileViewer
      :file="mainFile"
      v-model:file-in-preview="activeFile"
      :related-files="relatedFiles"
      :available-layouts="['horizontal', 'vertical', 'continuous']"
      zoomable
      downloadable
      storage-key="demo-advanced-viewer"
    />
  </div>
</template>
