<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const photo = ref({
  id: "9",
  name: "photo.jpg",
  size: 245760,
  type: "image/jpeg",
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
  <div style="display: flex; gap: 1rem; align-items: start">
    <div style="width: 160px; height: 120px">
      <DanxFile :file="photo" downloadable @download="onDownload" />
    </div>
    <div style="width: 160px; height: 120px">
      <DanxFile :file="photo" removable @remove="onRemove" />
    </div>
    <div style="width: 160px; height: 120px">
      <DanxFile :file="photo" downloadable removable />
    </div>
  </div>
  <p
    v-if="lastEvent"
    style="margin-top: 0.75rem; color: var(--color-text-muted); font-size: 0.875rem"
  >
    {{ lastEvent }}
  </p>
</template>
