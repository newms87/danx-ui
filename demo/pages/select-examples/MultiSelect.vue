<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const tags = ref([]);
const options = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="tags"
      :options="options"
      multiple
      label="Frameworks"
      placeholder="Select frameworks"
    />
    <p class="text-sm text-slate-500">Selected: {{ tags.length ? tags.join(", ") : "(none)" }}</p>
  </div>
</template>
