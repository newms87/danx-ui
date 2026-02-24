<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div class="flex gap-6 items-start">
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Rectangle (default)</p>
      <DanxSkeleton />
    </div>
    <div>
      <p class="m-0 mb-2 text-sm text-text-muted">Circle</p>
      <DanxSkeleton shape="circle" />
    </div>
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Rounded</p>
      <DanxSkeleton shape="rounded" style="--dx-skeleton-height: 3rem" />
    </div>
  </div>
</template>
