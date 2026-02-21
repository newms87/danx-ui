<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%">
    <DanxProgressBar :value="85" icon="check" variant="success" size="lg" />
    <DanxProgressBar :value="45" icon="clock" variant="warning" size="lg" label="Rating" />
  </div>
</template>
