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
  <div class="flex gap-6 items-start">
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="uploading" size="lg" />
      <span class="text-xs text-text-muted">default progress</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="customMessage" size="lg" />
      <span class="text-xs text-text-muted">custom message</span>
    </div>
  </div>
</template>
