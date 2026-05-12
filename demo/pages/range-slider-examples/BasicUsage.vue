<script setup>
import { ref } from "vue";
import { DanxRangeSlider } from "danx-ui";

const value = ref(50);
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxRangeSlider
      v-model="value"
      :min="0"
      :max="100"
      :step="1"
      ariaLabel="Single-handle example"
    />
    <div class="text-sm text-text-muted">Value: {{ value }}</div>
  </div>
</template>
