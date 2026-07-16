<script setup lang="ts">
import { ref } from "vue";
import { DanxTreeView } from "danx-ui";

const tree = [
  {
    id: "eng",
    label: "Engineering",
    children: [
      {
        id: "frontend",
        label: "Frontend",
        children: [
          { id: "alice", label: "Alice" },
          { id: "bob", label: "Bob" },
        ],
      },
      { id: "carol", label: "Carol" },
    ],
  },
  {
    id: "design",
    label: "Design",
    children: [{ id: "dana", label: "Dana" }],
  },
];

const selected = ref(null);
const expanded = ref(["eng"]);
</script>

<template>
  <div class="h-[300px] w-72 rounded-lg border border-border p-2 overflow-auto bg-surface">
    <DanxTreeView v-model:selected="selected" v-model:expanded="expanded" :nodes="tree" />
  </div>
  <p class="mt-3 text-sm text-text-subtle">Selected: {{ selected ?? "none" }}</p>
</template>
