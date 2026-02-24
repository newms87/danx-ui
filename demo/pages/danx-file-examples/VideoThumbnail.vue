<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const video = ref({
  id: "2",
  name: "demo-clip.mp4",
  size: 5242880,
  type: "video/mp4",
  url: "https://picsum.photos/seed/danx-vid/400/300",
  thumb: { url: "https://picsum.photos/seed/danx-vid/400/300" },
  children: [],
});
</script>

<template>
  <div class="w-40 h-[120px]">
    <DanxFile :file="video" />
  </div>
</template>
