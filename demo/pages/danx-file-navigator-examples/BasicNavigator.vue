<script setup lang="ts">
import { ref } from "vue";
import { DanxFileNavigator } from "danx-ui";

const file = ref({
  id: "1",
  name: "mountain-vista.jpg",
  size: 524288,
  type: "image/jpeg",
  url: "https://picsum.photos/seed/nav1/800/600",
  children: [],
});
</script>

<template>
  <div
    style="
      width: 100%;
      height: 400px;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      overflow: hidden;
    "
  >
    <DanxFileNavigator :file="file" downloadable />
  </div>
</template>
