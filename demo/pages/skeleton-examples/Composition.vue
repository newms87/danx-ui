<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div class="flex gap-8">
    <div class="flex-1 max-w-80 p-4 border border-border rounded-xl">
      <p class="m-0 mb-3 text-sm text-text-muted">Card skeleton</p>
      <div class="flex gap-3 items-center mb-4">
        <DanxSkeleton shape="circle" style="--dx-skeleton-circle-size: 2.5rem" />
        <DanxSkeleton
          shape="rounded"
          style="--dx-skeleton-width: 8rem; --dx-skeleton-height: 0.875rem"
        />
      </div>
      <DanxSkeleton shape="text" :lines="3" />
      <DanxSkeleton
        shape="rounded"
        style="--dx-skeleton-height: 8rem; --dx-skeleton-border-radius: 0.5rem"
        class="mt-4"
      />
    </div>
    <div class="flex-1 max-w-80 p-4 border border-border rounded-xl">
      <p class="m-0 mb-3 text-sm text-text-muted">Card skeleton (wave)</p>
      <div class="flex gap-3 items-center mb-4">
        <DanxSkeleton shape="circle" animation="wave" style="--dx-skeleton-circle-size: 2.5rem" />
        <DanxSkeleton
          shape="rounded"
          animation="wave"
          style="--dx-skeleton-width: 8rem; --dx-skeleton-height: 0.875rem"
        />
      </div>
      <DanxSkeleton shape="text" animation="wave" :lines="3" />
      <DanxSkeleton
        shape="rounded"
        animation="wave"
        style="--dx-skeleton-height: 8rem; --dx-skeleton-border-radius: 0.5rem"
        class="mt-4"
      />
    </div>
  </div>
</template>
