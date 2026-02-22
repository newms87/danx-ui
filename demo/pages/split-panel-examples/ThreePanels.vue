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
    style="height: 200px; border: 1px solid var(--color-border); border-radius: 0.5rem"
  >
    <template #toggles="{ panels: allPanels, isActive, toggle }">
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem">
        <button
          v-for="p in allPanels"
          :key="p.id"
          :style="{
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-border)',
            background: isActive(p.id) ? 'var(--color-interactive)' : 'var(--color-surface)',
            color: isActive(p.id) ? 'white' : 'var(--color-text)',
            cursor: 'pointer',
            fontSize: '0.8125rem',
          }"
          @click="toggle(p.id)"
        >
          {{ p.label }}
        </button>
      </div>
    </template>
    <template #nav>
      <div style="padding: 1rem; background: var(--color-surface-sunken); height: 100%">
        <strong>Nav</strong>
      </div>
    </template>
    <template #main>
      <div style="padding: 1rem; height: 100%">
        <strong>Main</strong>
        <p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--color-text-muted)">
          Toggle panels on/off with the buttons above.
        </p>
      </div>
    </template>
    <template #aside>
      <div style="padding: 1rem; background: var(--color-surface-sunken); height: 100%">
        <strong>Aside</strong>
      </div>
    </template>
  </DanxSplitPanel>
</template>
