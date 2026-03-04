<script setup>
import { ref } from "vue";

const panels = [
  { id: "nav", label: "Nav", defaultWidth: 1 },
  { id: "main", label: "Main", defaultWidth: 2 },
  { id: "aside", label: "Aside", defaultWidth: 1 },
];
const active = ref(["nav", "main", "aside"]);

const toggleButtons = panels.map((p) => ({ value: p.id, label: p.label }));
</script>

<template>
  <DanxSplitPanel
    v-model="active"
    :panels="panels"
    class="h-[200px] border border-border rounded-lg"
  >
    <template #toggles>
      <DanxButtonGroup v-model="active" :buttons="toggleButtons" multiple class="mb-3" />
    </template>
    <template #nav>
      <div class="p-4 bg-surface-sunken h-full">
        <strong>Nav</strong>
      </div>
    </template>
    <template #main>
      <div class="p-4 h-full">
        <strong>Main</strong>
        <p class="mt-2 text-sm text-text-muted">Toggle panels on/off with the buttons above.</p>
      </div>
    </template>
    <template #aside>
      <div class="p-4 bg-surface-sunken h-full">
        <strong>Aside</strong>
      </div>
    </template>
  </DanxSplitPanel>
</template>
