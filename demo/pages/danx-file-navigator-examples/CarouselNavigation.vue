<script setup lang="ts">
import { ref } from "vue";
import { DanxFileNavigator } from "danx-ui";

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
    style="
      width: 100%;
      height: 500px;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      overflow: hidden;
    "
  >
    <DanxFileNavigator
      :file="mainFile"
      v-model:file-in-preview="activeFile"
      :related-files="relatedFiles"
      downloadable
    />
  </div>
</template>
