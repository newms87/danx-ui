<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const errorFile = ref({
  id: "5",
  name: "corrupted.jpg",
  size: 0,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/danx-err/400/300",
  error: "Upload failed: file too large (max 10MB)",
  children: [],
});
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <DanxFile :file="errorFile" size="lg" />
    <span class="text-xs text-text-muted">error overlay</span>
  </div>
</template>
