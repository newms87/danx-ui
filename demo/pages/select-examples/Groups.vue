<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const selected = ref(null);
const options = [
  { value: "apple", label: "Apple", group: "Fruits" },
  { value: "banana", label: "Banana", group: "Fruits" },
  { value: "mango", label: "Mango", group: "Fruits" },
  { value: "carrot", label: "Carrot", group: "Vegetables" },
  { value: "broccoli", label: "Broccoli", group: "Vegetables" },
  { value: "spinach", label: "Spinach", group: "Vegetables" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect v-model="selected" :options="options" label="Food" placeholder="Pick a food" />
    <p class="text-sm text-slate-500">Selected: {{ selected ?? "(none)" }}</p>
  </div>
</template>
