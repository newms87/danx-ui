<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const photo = ref({
  id: "1",
  name: "beach-sunset.jpg",
  size: 245760,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/danx-sizes/400/300",
  children: [],
});
</script>

<template>
  <div class="flex gap-4 items-end flex-wrap">
    <DanxFile :file="photo" size="xs" />
    <DanxFile :file="photo" size="sm" />
    <DanxFile :file="photo" size="md" />
    <DanxFile :file="photo" size="lg" />
    <DanxFile :file="photo" size="xl" show-filename />
  </div>
</template>
