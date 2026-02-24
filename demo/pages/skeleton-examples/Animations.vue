<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-start">
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Pulse (default)</p>
      <DanxSkeleton animation="pulse" style="--dx-skeleton-height: 3rem" />
    </div>
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Wave</p>
      <DanxSkeleton animation="wave" style="--dx-skeleton-height: 3rem" />
    </div>
  </div>
</template>
