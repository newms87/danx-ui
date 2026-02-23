<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 1.5rem; align-items: start">
    <div style="flex: 1">
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">Rectangle (default)</p>
      <DanxSkeleton />
    </div>
    <div>
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">Circle</p>
      <DanxSkeleton shape="circle" />
    </div>
    <div style="flex: 1">
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">Rounded</p>
      <DanxSkeleton shape="rounded" style="--dx-skeleton-height: 3rem" />
    </div>
  </div>
</template>
