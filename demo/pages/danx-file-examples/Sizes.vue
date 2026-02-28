<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const photo = ref({
  id: "1",
  name: "beach-sunset.jpg",
  size: 245760,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/danx-sizes/400/300",
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
      <DanxFile :file="photo" :size="s" />
      <span class="text-xs text-text-muted">{{ s }}</span>
    </div>
  </div>
</template>
