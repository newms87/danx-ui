<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%">
    <DanxProgressBar indeterminate />
    <DanxProgressBar indeterminate variant="success" />
    <DanxProgressBar indeterminate variant="danger" size="lg" />
  </div>
</template>
