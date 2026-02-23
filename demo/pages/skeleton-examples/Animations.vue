<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: start">
    <div style="flex: 1">
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">Pulse (default)</p>
      <DanxSkeleton animation="pulse" style="--dx-skeleton-height: 3rem" />
    </div>
    <div style="flex: 1">
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">Wave</p>
      <DanxSkeleton animation="wave" style="--dx-skeleton-height: 3rem" />
    </div>
  </div>
</template>
