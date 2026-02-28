<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const color = ref(null);
const options = [
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "yellow", label: "Yellow" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="color"
      :options="options"
      label="Favorite Color"
      placeholder="Pick a color"
    />
    <p class="text-sm text-slate-500">Selected: {{ color ?? "(none)" }}</p>
  </div>
</template>
