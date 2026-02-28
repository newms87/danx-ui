<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const video = ref({
  id: "2",
  name: "demo-clip.mp4",
  size: 5242880,
  mime: "video/mp4",
  url: "https://picsum.photos/seed/danx-vid/400/300",
  thumb: { url: "https://picsum.photos/seed/danx-vid/400/300" },
  children: [],
});
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <DanxFile :file="video" size="lg" />
    <span class="text-xs text-text-muted">video with play icon</span>
  </div>
</template>
