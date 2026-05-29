<script setup lang="ts">
import { ref } from "vue";
import { DanxFileExplorer } from "danx-ui";

const tree = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "components",
        name: "components",
        children: [
          { id: "Button.vue", name: "Button.vue" },
          { id: "Dialog.vue", name: "Dialog.vue" },
        ],
      },
      { id: "index.ts", name: "index.ts" },
      { id: "main.ts", name: "main.ts" },
    ],
  },
  {
    id: "public",
    name: "public",
    children: [{ id: "favicon.ico", name: "favicon.ico" }],
  },
  { id: "package.json", name: "package.json" },
  { id: "README.md", name: "README.md" },
];

const selected = ref(null);
const expanded = ref(["src"]);
</script>

<template>
  <div class="h-[360px] w-72 rounded-lg border border-border p-2 overflow-auto bg-surface">
    <DanxFileExplorer v-model:selected="selected" v-model:expanded="expanded" :nodes="tree" />
  </div>
  <p class="mt-3 text-sm text-text-subtle">Selected: {{ selected ?? "none" }}</p>
</template>
