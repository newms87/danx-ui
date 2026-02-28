<script setup>
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const errorFile = ref({
  id: "5",
  name: "corrupted.jpg",
  size: 0,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/danx-err/400/300",
  error: "Upload failed: file too large (max 10MB)",
  children: [],
});
</script>

<template>
  <div class="flex gap-6 items-end flex-wrap">
    <div
      v-for="s in ['xs', 'sm', 'md', 'lg', 'xl']"
      :key="s"
      class="flex flex-col items-center gap-1"
    >
      <DanxFile :file="errorFile" :size="s" />
      <span class="text-xs text-text-muted">{{ s }}</span>
    </div>
  </div>
</template>
