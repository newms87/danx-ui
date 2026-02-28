<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const selected = ref(null);
const options = ref([
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
]);

function handleCreate(text) {
  options.value.push({ value: text.toLowerCase().replace(/\s+/g, "-"), label: text });
  selected.value = text.toLowerCase().replace(/\s+/g, "-");
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="selected"
      :options="options"
      filterable
      creatable
      label="Colors (creatable)"
      placeholder="Type to search or create..."
      @create="handleCreate"
    />
    <p class="text-sm text-slate-500">Selected: {{ selected ?? "(none)" }}</p>
    <p class="text-sm text-slate-500">Options: {{ options.map((o) => o.label).join(", ") }}</p>
  </div>
</template>
