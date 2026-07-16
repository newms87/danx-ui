<script setup lang="ts">
import { DanxLoadingOverlay } from "danx-ui";
</script>

<template>
  <div style="position: relative; width: 16rem; height: 8rem" class="border rounded">
    <p class="p-4 m-0">Custom spinner size and color.</p>
    <DanxLoadingOverlay
      show
      message="Uploading..."
      style="
        --dx-loading-overlay-spinner-size: 3rem;
        --dx-loading-overlay-spinner-color: var(--color-success);
      "
    />
  </div>
</template>
