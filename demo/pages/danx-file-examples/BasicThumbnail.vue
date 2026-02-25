<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const photo = ref({
  id: "1",
  name: "beach-sunset.jpg",
  size: 245760,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/danx1/400/300",
  children: [],
});
</script>

<template>
  <div class="flex gap-6 items-start">
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" />
      <span class="text-xs text-text-muted">cover (default)</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" fit="contain" />
      <span class="text-xs text-text-muted">contain</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" show-filename />
      <span class="text-xs text-text-muted">with filename</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" show-filename show-file-size />
      <span class="text-xs text-text-muted">with file size</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" show-file-size />
      <span class="text-xs text-text-muted">size only</span>
    </div>
  </div>
</template>
