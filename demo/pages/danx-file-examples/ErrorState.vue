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
  <div style="width: 160px; height: 120px">
    <DanxFile :file="errorFile" />
  </div>
</template>
