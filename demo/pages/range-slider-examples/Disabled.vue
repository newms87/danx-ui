<script setup>
import { ref } from "vue";
import { DanxRangeSlider } from "danx-ui";

const single = ref(40);
const dual = ref([20, 80]);
</script>

<template>
  <div class="flex flex-col gap-8 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxRangeSlider v-model="single" disabled ariaLabel="Disabled single-handle" />
      <span class="text-xs text-text-muted">Disabled, single-handle (value: {{ single }})</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRangeSlider v-model="dual" disabled ariaLabel="Disabled dual-handle" />
      <span class="text-xs text-text-muted"
        >Disabled, dual-handle (range: {{ dual[0] }}-{{ dual[1] }})</span
      >
    </div>
  </div>
</template>
