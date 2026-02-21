<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 400px">
    <DanxProgressBar indeterminate />
    <DanxProgressBar indeterminate type="success" />
    <DanxProgressBar indeterminate type="danger" size="lg" />
  </div>
</template>
