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
      <p class="m-0 mb-3 text-[0.8125rem] text-text-muted">
        Try toggling both off — the last panel cannot be deactivated.
      </p>
    </template>
    <template #left>
      <div class="p-4 bg-surface-sunken h-full">
        <strong>Left Panel</strong>
      </div>
    </template>
    <template #right>
      <div class="p-4 h-full">
        <strong>Right Panel</strong>
      </div>
    </template>
  </DanxSplitPanel>
</template>
