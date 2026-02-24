<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <DanxTooltip icon="info" variant="info">
    <template #trigger>
      <span class="underline cursor-help">Rich content tooltip</span>
    </template>
    <div>
      <strong>Rich HTML content</strong>
      <p class="mt-1">Tooltips can contain any HTML via the default slot.</p>
    </div>
  </DanxTooltip>
</template>
