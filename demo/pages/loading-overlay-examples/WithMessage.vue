<script setup lang="ts">
import { DanxLoadingOverlay } from "danx-ui";
</script>

<template>
  <div style="position: relative; width: 16rem; height: 8rem" class="border rounded">
    <p class="p-4 m-0">Form fields go here.</p>
    <DanxLoadingOverlay show message="Saving changes..." />
  </div>
</template>
