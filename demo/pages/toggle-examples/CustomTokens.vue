<script setup>
import { ref } from "vue";
import { DanxToggle } from "danx-ui";

const brandToggle = ref(true);
const wideToggle = ref(true);
</script>

<template>
  <div class="flex items-center gap-8">
    <div class="flex flex-col items-center gap-2">
      <DanxToggle
        v-model="brandToggle"
        style="
          --dx-toggle-track-bg-on: oklch(0.7 0.2 320);
          --dx-toggle-thumb-bg: oklch(0.98 0.02 320);
        "
      />
      <span class="text-xs text-text-muted">Custom brand color</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <DanxToggle
        v-model="wideToggle"
        style="
          --dx-toggle-md-track-w: 56px;
          --dx-toggle-md-track-h: 28px;
          --dx-toggle-md-thumb-size: 22px;
        "
      />
      <span class="text-xs text-text-muted">Resized via tokens</span>
    </div>
  </div>
</template>
