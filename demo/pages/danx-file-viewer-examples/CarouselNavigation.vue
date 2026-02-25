<script setup lang="ts">
import { ref } from "vue";
import { DanxFileViewer } from "danx-ui";

const mainFile = ref({
  id: "1",
  name: "sunset.jpg",
  size: 524288,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/carousel1/800/600",
  children: [],
});

const relatedFiles = ref([
  {
    id: "2",
    name: "ocean.jpg",
    size: 409600,
    type: "image/jpeg",
    url: "https://picsum.photos/seed/carousel2/800/600",
    children: [],
  },
  {
    id: "3",
    name: "forest.jpg",
    size: 368640,
    type: "image/jpeg",
    url: "https://picsum.photos/seed/carousel3/800/600",
    children: [],
  },
  {
    id: "4",
    name: "desert.jpg",
    size: 491520,
    type: "image/jpeg",
    url: "https://picsum.photos/seed/carousel4/800/600",
    children: [],
  },
]);

const activeFile = ref(null);
</script>

<template>
  <div
    class="w-full h-[500px] border border-border rounded-lg overflow-hidden"
  >
    <DanxFileViewer
      :file="mainFile"
      v-model:file-in-preview="activeFile"
      :related-files="relatedFiles"
      downloadable
    />
  </div>
</template>
