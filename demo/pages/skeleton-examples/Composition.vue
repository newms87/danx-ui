<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem">
    <div
      style="
        flex: 1;
        max-width: 320px;
        padding: 1rem;
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
      "
    >
      <p style="margin: 0 0 0.75rem; font-size: 0.875rem; color: gray">Card skeleton</p>
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem">
        <DanxSkeleton shape="circle" style="--dx-skeleton-circle-size: 2.5rem" />
        <DanxSkeleton
          shape="rounded"
          style="--dx-skeleton-width: 8rem; --dx-skeleton-height: 0.875rem"
        />
      </div>
      <DanxSkeleton shape="text" :lines="3" />
      <DanxSkeleton
        shape="rounded"
        style="--dx-skeleton-height: 8rem; --dx-skeleton-border-radius: 0.5rem; margin-top: 1rem"
      />
    </div>
    <div
      style="
        flex: 1;
        max-width: 320px;
        padding: 1rem;
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
      "
    >
      <p style="margin: 0 0 0.75rem; font-size: 0.875rem; color: gray">Card skeleton (wave)</p>
      <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem">
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
        style="--dx-skeleton-height: 8rem; --dx-skeleton-border-radius: 0.5rem; margin-top: 1rem"
      />
    </div>
  </div>
</template>
