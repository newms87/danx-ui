<script setup>
import { ref } from "vue";

const panels = [
  { id: "left", label: "Left", defaultWidth: 50 },
  { id: "right", label: "Right", defaultWidth: 50 },
];
const active = ref(["left", "right"]);

const toggleButtons = panels.map((p) => ({ value: p.id, label: p.label }));
</script>

<template>
  <DanxSplitPanel
    v-model="active"
    :panels="panels"
    require-active
    class="h-[200px] border border-border rounded-lg"
  >
    <template #toggles>
      <DanxButtonGroup v-model="active" :buttons="toggleButtons" multiple required />
      <p class="m-0 my-3 text-[0.8125rem] text-text-muted">
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
