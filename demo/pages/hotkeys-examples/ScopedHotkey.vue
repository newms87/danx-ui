<script setup>
import { ref } from "vue";
import { useHotkeys } from "danx-ui";

const panel = ref(null);
const enabled = ref(true);
const log = ref([]);

useHotkeys(
  "escape",
  () => {
    log.value.unshift(`Escape at ${new Date().toLocaleTimeString()}`);
  },
  { target: panel, enabled }
);
</script>

<template>
  <div class="flex flex-col gap-3">
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" v-model="enabled" />
      Listener enabled
    </label>
    <div
      ref="panel"
      tabindex="0"
      class="rounded border border-gray-300 dark:border-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-info-500"
    >
      Focus this panel, then press Escape.
    </div>
    <ul class="text-xs text-text-muted list-disc pl-4">
      <li v-for="(entry, i) in log" :key="i">{{ entry }}</li>
    </ul>
  </div>
</template>
