<script setup>
import { ref } from "vue";

const panels = [
  { id: "nav", label: "Nav", defaultWidth: 1 },
  { id: "main", label: "Main", defaultWidth: 2 },
  { id: "aside", label: "Aside", defaultWidth: 1 },
];
const active = ref(["nav", "main", "aside"]);
</script>

<template>
  <DanxSplitPanel
    v-model="active"
    :panels="panels"
    class="h-[200px] border border-border rounded-lg"
  >
    <template #toggles="{ panels: allPanels, isActive, toggle }">
      <div class="flex gap-2 mb-3">
        <button
          v-for="p in allPanels"
          :key="p.id"
          :style="{
            background: isActive(p.id) ? 'var(--color-interactive)' : 'var(--color-surface)',
            color: isActive(p.id) ? 'white' : 'var(--color-text)',
          }"
          class="px-3 py-1.5 rounded border border-border cursor-pointer text-[0.8125rem]"
          @click="toggle(p.id)"
        >
          {{ p.label }}
        </button>
      </div>
    </template>
    <template #nav>
      <div class="p-4 bg-surface-sunken h-full">
        <strong>Nav</strong>
      </div>
    </template>
    <template #main>
      <div class="p-4 h-full">
        <strong>Main</strong>
        <p class="mt-2 text-sm text-text-muted">
          Toggle panels on/off with the buttons above.
        </p>
      </div>
    </template>
    <template #aside>
      <div class="p-4 bg-surface-sunken h-full">
        <strong>Aside</strong>
      </div>
    </template>
  </DanxSplitPanel>
</template>
