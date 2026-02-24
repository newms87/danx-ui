<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const uploading = ref({
  id: "3",
  name: "uploading.jpg",
  size: 1048576,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/danx-prog/400/300",
  progress: 45,
  children: [],
});

const customMessage = ref({
  id: "4",
  name: "converting.mp4",
  size: 10485760,
  type: "video/mp4",
  url: "https://picsum.photos/seed/danx-conv/400/300",
  thumb: { url: "https://picsum.photos/seed/danx-conv/400/300" },
  progress: 72,
  statusMessage: "Converting to MP4...",
  children: [],
});
</script>

<template>
  <div class="flex gap-4 items-start">
    <div class="w-40 h-[120px]">
      <DanxFile :file="uploading" />
    </div>
    <div class="w-40 h-[120px]">
      <DanxFile :file="customMessage" />
    </div>
  </div>
</template>
