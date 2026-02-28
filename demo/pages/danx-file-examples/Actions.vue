<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const photo = ref({
  id: "9",
  name: "photo.jpg",
  size: 245760,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/danx-act/400/300",
  children: [],
});

const lastEvent = ref("");

function onDownload(file) {
  lastEvent.value = "Downloaded: " + file.name;
}

function onRemove(file) {
  lastEvent.value = "Removed: " + file.name;
}
</script>

<template>
  <div class="flex gap-6 items-start">
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" downloadable @download="onDownload" />
      <span class="text-xs text-text-muted">downloadable</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" removable @remove="onRemove" />
      <span class="text-xs text-text-muted">removable</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="photo" size="lg" downloadable removable />
      <span class="text-xs text-text-muted">both</span>
    </div>
  </div>
  <p v-if="lastEvent" class="mt-3 text-sm text-text-muted">
    {{ lastEvent }}
  </p>
</template>
