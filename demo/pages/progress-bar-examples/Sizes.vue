<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div>
      <div class="text-xs text-text-muted mb-1">Small</div>
      <DanxProgressBar :value="40" size="sm" />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Medium (default)</div>
      <DanxProgressBar :value="60" size="md" />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Large</div>
      <DanxProgressBar :value="80" size="lg" />
    </div>
  </div>
</template>
