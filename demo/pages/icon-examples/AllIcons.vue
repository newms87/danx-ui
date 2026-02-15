<script setup lang="ts">
import { buttonIcons } from "danx-ui";

const iconNames = Object.keys(buttonIcons);
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center">
    <div
      v-for="name in iconNames"
      :key="name"
      style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem; width: 5rem"
    >
      <DanxIcon :icon="name" style="--dx-icon-size: 1.25rem" />
      <span style="font-size: 0.65rem; color: gray">{{ name }}</span>
    </div>
  </div>
</template>
