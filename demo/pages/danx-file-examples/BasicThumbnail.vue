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
  <div class="flex gap-4 items-start">
    <div class="w-40 h-[120px]">
      <DanxFile :file="photo" />
    </div>
    <div class="w-40 h-[120px]">
      <DanxFile :file="photo" fit="contain" />
    </div>
    <div class="w-40 h-[120px]">
      <DanxFile :file="photo" show-filename />
    </div>
  </div>
</template>
