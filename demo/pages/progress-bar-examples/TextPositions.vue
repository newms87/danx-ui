<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div>
      <div class="text-xs text-text-muted mb-1">Inside (default)</div>
      <DanxProgressBar :value="65" size="lg" textPosition="inside" />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Above</div>
      <DanxProgressBar :value="65" textPosition="above" />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Beside</div>
      <DanxProgressBar :value="65" textPosition="beside" />
    </div>
    <div>
      <div class="text-xs text-text-muted mb-1">Custom label</div>
      <DanxProgressBar :value="3" :max="10" label="3 of 10 files" size="lg" />
    </div>
  </div>
</template>
