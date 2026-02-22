<script setup>
import { ref } from "vue";

const panels = [
  { id: "left", label: "Left", defaultWidth: 50 },
  { id: "right", label: "Right", defaultWidth: 50 },
];
const active = ref(["left", "right"]);
</script>

<template>
  <DanxSplitPanel
    v-model="active"
    :panels="panels"
    require-active
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
      <p style="margin: 0 0 0.75rem; font-size: 0.8125rem; color: var(--color-text-muted)">
        Try toggling both off — the last panel cannot be deactivated.
      </p>
    </template>
    <template #left>
      <div style="padding: 1rem; background: var(--color-surface-sunken); height: 100%">
        <strong>Left Panel</strong>
      </div>
    </template>
    <template #right>
      <div style="padding: 1rem; height: 100%">
        <strong>Right Panel</strong>
      </div>
    </template>
  </DanxSplitPanel>
</template>
