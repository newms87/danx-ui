<script setup lang="ts">
import { ref } from "vue";
import { DanxNumberInput } from "danx-ui";

const price = ref(0.2);
const rate = ref(1.5);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxNumberInput
      v-model="price"
      label="Price"
      helper-text="Step up from 0.2 and you get exactly 0.3, with no float drift."
      :step="0.1"
      :min="0"
    />
    <DanxNumberInput v-model="rate" label="Rate" :step="0.25" :min="0" :max="10" />
    <p class="text-sm text-slate-500">Price: {{ price }} — Rate: {{ rate }}</p>
  </div>
</template>
