<script setup>
import { ref } from "vue";
import { DanxRangeSlider } from "danx-ui";

const window = ref([20, 80]);
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxRangeSlider
      v-model="window"
      :min="0"
      :max="100"
      :step="5"
      ariaLabel="Dual-handle example"
    />
    <div class="text-sm text-text-muted">Range: {{ window[0] }} → {{ window[1] }}</div>
  </div>
</template>
