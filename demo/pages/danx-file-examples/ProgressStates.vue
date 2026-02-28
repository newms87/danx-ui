<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const uploading = ref({
  id: "3",
  name: "uploading.jpg",
  size: 1048576,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/danx-prog/400/300",
  progress: 45,
  children: [],
});

const customMessage = ref({
  id: "4",
  name: "converting.mp4",
  size: 10485760,
  mime: "video/mp4",
  url: "https://picsum.photos/seed/danx-conv/400/300",
  thumb: { url: "https://picsum.photos/seed/danx-conv/400/300" },
  progress: 72,
  statusMessage: "Converting to MP4...",
  children: [],
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="text-sm text-text-muted mb-2">Default progress at all sizes</p>
      <div class="flex gap-6 items-end flex-wrap">
        <div
          v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']"
          :key="s"
          class="flex flex-col items-center gap-1"
        >
          <DanxFile :file="uploading" :size="s" />
          <span class="text-xs text-text-muted">{{ s }}</span>
        </div>
      </div>
    </div>
    <div>
      <p class="text-sm text-text-muted mb-2">Custom status message</p>
      <div class="flex flex-col items-center gap-1 w-fit">
        <DanxFile :file="customMessage" size="lg" />
        <span class="text-xs text-text-muted">custom message</span>
      </div>
    </div>
  </div>
</template>
