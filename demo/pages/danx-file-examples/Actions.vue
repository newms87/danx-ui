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
  <div class="flex gap-4 items-start">
    <div class="w-40 h-[120px]">
      <DanxFile :file="photo" downloadable @download="onDownload" />
    </div>
    <div class="w-40 h-[120px]">
      <DanxFile :file="photo" removable @remove="onRemove" />
    </div>
    <div class="w-40 h-[120px]">
      <DanxFile :file="photo" downloadable removable />
    </div>
  </div>
  <p
    v-if="lastEvent"
    class="mt-3 text-sm text-text-muted"
  >
    {{ lastEvent }}
  </p>
</template>
