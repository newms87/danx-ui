<script setup lang="ts">
import { computed, ref } from "vue";
import { DanxButton, DanxDropdownMenu } from "danx-ui";

const MODELS = [
  { id: "fable", label: "Fable 5" },
  { id: "opus", label: "Opus 5" },
  { id: "sonnet", label: "Sonnet 5" },
];

const OLDER = [
  { id: "haiku", label: "Haiku 4.5" },
  { id: "opus4", label: "Opus 4.8" },
];

const selected = ref("opus");

const label = computed(
  () => [...MODELS, ...OLDER].find((m) => m.id === selected.value)?.label ?? "Choose"
);

const items = computed(() => [
  ...MODELS.map((m, i) => ({
    label: m.label,
    shortcut: String(i + 1),
    active: selected.value === m.id,
    action: () => (selected.value = m.id),
  })),
  { label: "", separator: true },
  {
    label: "More models",
    children: OLDER.map((m) => ({
      label: m.label,
      active: selected.value === m.id,
      action: () => (selected.value = m.id),
    })),
  },
]);
</script>

<template>
  <div class="flex flex-col items-start gap-3">
    <DanxDropdownMenu :items="items">
      <DanxButton size="sm" variant="muted">{{ label }}</DanxButton>
    </DanxDropdownMenu>
    <p class="text-sm text-slate-500">
      A picker, not an action list — the current choice carries a check, and the parent of a
      submenu shows active when one of its children is selected.
    </p>
  </div>
</template>
