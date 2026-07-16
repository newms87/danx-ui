<script setup lang="ts">
import { ref } from "vue";
import { DanxTreeView } from "danx-ui";

const tree = [
  {
    id: "read",
    label: "Read",
    children: [
      { id: "read-own", label: "Own records" },
      { id: "read-team", label: "Team records" },
    ],
  },
  {
    id: "write",
    label: "Write",
    children: [
      { id: "write-own", label: "Own records" },
      { id: "write-team", label: "Team records", disabled: true },
    ],
  },
  { id: "admin", label: "Admin" },
];

const selected = ref(["read-own"]);
const expanded = ref(["read", "write"]);
</script>

<template>
  <div class="h-[300px] w-80 rounded-lg border border-border p-2 overflow-auto bg-surface">
    <DanxTreeView v-model:selected="selected" v-model:expanded="expanded" :nodes="tree" multiple />
  </div>
  <p class="mt-3 text-sm text-text-subtle">Selected: {{ selected.join(", ") || "none" }}</p>
</template>
