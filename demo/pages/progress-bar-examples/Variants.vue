<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%">
    <DanxProgressBar :value="70" size="lg" />
    <DanxProgressBar :value="30" variant="danger" size="lg" />
    <DanxProgressBar :value="90" variant="success" size="lg" />
    <DanxProgressBar :value="55" variant="warning" size="lg" />
    <DanxProgressBar :value="45" variant="info" size="lg" />
    <DanxProgressBar :value="60" variant="muted" size="lg" />
  </div>
</template>
