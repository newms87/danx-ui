<script setup lang="ts">
import { ref } from "vue";
import { DanxFileViewer } from "danx-ui";

const file = ref({
  id: "1",
  name: "mountain-vista.jpg",
  size: 524288,
  mime: "image/jpeg",
  url: "https://picsum.photos/seed/nav1/800/600",
  children: [],
});
</script>

<template>
  <div class="w-full h-[400px] border border-border rounded-lg overflow-hidden">
    <DanxFileViewer :file="file" downloadable />
  </div>
</template>
