<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%">
    <DanxProgressBar :value="85" :icon="starIcon" type="success" size="lg" />
    <DanxProgressBar :value="45" :icon="starIcon" type="warning" size="lg" label="Rating" />
  </div>
</template>
