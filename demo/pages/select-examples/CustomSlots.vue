<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const selected = ref(null);
const options = [
  { value: "critical", label: "Critical", description: "System is down" },
  { value: "warning", label: "Warning", description: "Degraded performance" },
  { value: "info", label: "Info", description: "Informational notice" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="selected"
      :options="options"
      label="With Descriptions"
      placeholder="Select a severity"
    >
      <template #header>
        <div
          class="px-3 py-2 text-xs font-semibold text-slate-400 uppercase border-b border-slate-200"
        >
          Severity Levels
        </div>
      </template>
      <template #footer>
        <div class="px-3 py-2 text-xs text-slate-400 border-t border-slate-200">
          3 levels available
        </div>
      </template>
    </DanxSelect>
    <p class="text-sm text-slate-500">Selected: {{ selected ?? "(none)" }}</p>
  </div>
</template>
