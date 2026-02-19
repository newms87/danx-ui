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
  <div style="display: flex; gap: 1rem; align-items: start">
    <div style="width: 160px; height: 120px">
      <DanxFile :file="photo" />
    </div>
    <div style="width: 160px; height: 120px">
      <DanxFile :file="photo" fit="contain" />
    </div>
    <div style="width: 160px; height: 120px">
      <DanxFile :file="photo" show-filename />
    </div>
  </div>
</template>
