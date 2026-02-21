<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <DanxTooltip icon="info" variant="info">
    <template #trigger>
      <span style="text-decoration: underline; cursor: help">Rich content tooltip</span>
    </template>
    <div>
      <strong>Rich HTML content</strong>
      <p style="margin: 0.25rem 0 0">Tooltips can contain any HTML via the default slot.</p>
    </div>
  </DanxTooltip>
</template>
