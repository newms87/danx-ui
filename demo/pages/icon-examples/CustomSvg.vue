<script setup lang="ts">
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";
</script>

<template>
  <div style="display: flex; gap: 1rem; align-items: center">
    <DanxIcon :icon="starIcon" style="--dx-icon-size: 1.5rem; color: gold" />
    <DanxIcon
      icon='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
      style="--dx-icon-size: 1.5rem; color: teal"
    />
  </div>
</template>
