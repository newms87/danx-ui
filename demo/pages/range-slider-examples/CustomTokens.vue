<script setup>
import { ref } from "vue";
import { DanxRangeSlider } from "danx-ui";

const tall = ref(60);
const brand = ref([25, 75]);
</script>

<template>
  <div class="flex flex-col gap-8 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxRangeSlider
        v-model="tall"
        ariaLabel="Tall track"
        style="--dx-range-slider-track-h: 8px; --dx-range-slider-handle-size: 24px"
      />
      <span class="text-xs text-text-muted">Taller track + larger handle via tokens</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRangeSlider
        v-model="brand"
        ariaLabel="Brand color"
        style="
          --dx-range-slider-track-fill-bg: oklch(0.7 0.2 320);
          --dx-range-slider-handle-border: oklch(0.7 0.2 320);
        "
      />
      <span class="text-xs text-text-muted">Custom brand color via token overrides</span>
    </div>
  </div>
</template>
