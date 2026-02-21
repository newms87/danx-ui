<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 400px">
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Small</div>
      <DanxProgressBar :value="40" size="sm" />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Medium (default)</div>
      <DanxProgressBar :value="60" size="md" />
    </div>
    <div>
      <div style="font-size: 0.75rem; color: gray; margin-bottom: 0.25rem">Large</div>
      <DanxProgressBar :value="80" size="lg" />
    </div>
  </div>
</template>
