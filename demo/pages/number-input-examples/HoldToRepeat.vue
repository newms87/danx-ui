<script setup lang="ts">
import { ref } from "vue";
import { DanxNumberInput } from "danx-ui";

const fast = ref(0);
const slow = ref(0);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxNumberInput
      v-model="fast"
      label="Snappy (default)"
      helper-text="Hold a stepper: 400ms delay, then a step every 80ms."
      :min="0"
      :max="500"
    />
    <DanxNumberInput
      v-model="slow"
      label="Deliberate"
      helper-text="A longer delay and interval, for values where a slip is expensive."
      :min="0"
      :max="500"
      :hold-delay="900"
      :hold-interval="300"
    />
    <p class="text-sm text-slate-500">Snappy: {{ fast }} — Deliberate: {{ slow }}</p>
  </div>
</template>
