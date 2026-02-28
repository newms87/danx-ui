<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const country = ref(null);
const options = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" },
  { value: "uk", label: "United Kingdom" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "in", label: "India" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="country"
      :options="options"
      filterable
      label="Country"
      placeholder="Search countries..."
      filter-placeholder="Type to filter..."
    />
    <p class="text-sm text-slate-500">Selected: {{ country ?? "(none)" }}</p>
  </div>
</template>
