<script setup lang="ts">
import { iconRegistry } from "danx-ui";

const iconNames = Object.keys(iconRegistry);
</script>

<template>
  <div class="flex flex-wrap gap-4 items-center">
    <div v-for="name in iconNames" :key="name" class="flex flex-col items-center gap-1 w-20">
      <DanxIcon :icon="name" style="--dx-icon-size: 1.25rem" />
      <span class="text-[0.65rem] text-text-muted">{{ name }}</span>
    </div>
  </div>
</template>
