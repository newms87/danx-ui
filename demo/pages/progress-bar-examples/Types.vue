<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%">
    <DanxProgressBar :value="70" size="lg" />
    <DanxProgressBar :value="30" type="danger" size="lg" />
    <DanxProgressBar :value="90" type="success" size="lg" />
    <DanxProgressBar :value="55" type="warning" size="lg" />
    <DanxProgressBar :value="45" type="info" size="lg" />
    <DanxProgressBar :value="60" type="muted" size="lg" />
  </div>
</template>
