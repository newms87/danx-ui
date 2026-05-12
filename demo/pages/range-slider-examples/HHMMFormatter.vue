<script setup>
import { ref } from "vue";
import { DanxRangeSlider } from "danx-ui";

// Minutes-of-day range — 09:00-17:00 = [540, 1020]
const hours = ref([540, 1020]);

function formatHHMM(value) {
  const h = Math.floor(value / 60);
  const m = value % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <DanxRangeSlider v-model="hours" :min="0" :max="1440" :step="15" ariaLabel="Business hours">
      <template #value="{ value }">{{ formatHHMM(value) }}</template>
    </DanxRangeSlider>
    <div class="text-sm text-text-muted">
      Open {{ formatHHMM(hours[0]) }} → close {{ formatHHMM(hours[1]) }}
    </div>
  </div>
</template>
