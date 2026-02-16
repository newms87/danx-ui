<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <button
      id="external-target"
      style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 0.25rem"
    >
      External target
    </button>
    <DanxTooltip targetId="external-target" tooltip="Anchored to the button via target prop" />
  </div>
</template>
