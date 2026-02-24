<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-start">
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Custom colors</p>
      <DanxSkeleton style="--dx-skeleton-bg: oklch(0.8 0.1 240); --dx-skeleton-height: 2rem" />
    </div>
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Custom size + speed</p>
      <DanxSkeleton
        shape="rounded"
        style="
          --dx-skeleton-width: 200px;
          --dx-skeleton-height: 80px;
          --dx-skeleton-border-radius: 1rem;
          --dx-skeleton-pulse-duration: 0.8s;
        "
      />
    </div>
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Custom wave highlight</p>
      <DanxSkeleton
        animation="wave"
        style="
          --dx-skeleton-height: 2rem;
          --dx-skeleton-highlight: oklch(0.9 0.15 140 / 0.6);
          --dx-skeleton-wave-duration: 1s;
        "
      />
    </div>
  </div>
</template>
