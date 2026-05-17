<script setup>
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const a = ref("#3b82f6");
const b = ref("#a855f7");
</script>

<template>
  <div class="flex flex-col gap-8 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxColorPicker
        v-model="a"
        label="Big swatch"
        style="--dx-color-picker-swatch-size: 2.5rem; --dx-color-picker-input-width: 9rem"
      />
      <span class="text-xs text-text-muted">Bigger swatch + wider input via tokens</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxColorPicker
        v-model="b"
        label="Branded"
        style="
          --dx-color-picker-tab-active-bar: oklch(0.7 0.2 320);
          --dx-color-picker-accent: oklch(0.7 0.2 320);
          --dx-color-picker-panel-radius: 1rem;
        "
      />
      <span class="text-xs text-text-muted">Branded accent + larger panel radius</span>
    </div>
  </div>
</template>
