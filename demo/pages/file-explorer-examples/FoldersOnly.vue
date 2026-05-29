<script setup lang="ts">
import { ref } from "vue";
import { DanxFileExplorer, DanxToggle } from "danx-ui";

const tree = [
  {
    id: "app",
    name: "app",
    children: [
      {
        id: "models",
        name: "models",
        children: [
          { id: "user.ts", name: "user.ts" },
          { id: "post.ts", name: "post.ts" },
        ],
      },
      {
        id: "views",
        name: "views",
        children: [{ id: "home.vue", name: "home.vue" }],
      },
      { id: "boot.ts", name: "boot.ts" },
    ],
  },
  {
    id: "tests",
    name: "tests",
    children: [{ id: "app.test.ts", name: "app.test.ts" }],
  },
  { id: "vite.config.ts", name: "vite.config.ts" },
];

const foldersOnly = ref(true);
const selectedFolder = ref(null);
</script>

<template>
  <div class="mb-3 flex items-center gap-2">
    <DanxToggle v-model="foldersOnly" />
    <span class="text-sm">Folders only</span>
  </div>
  <div class="h-[320px] w-72 rounded-lg border border-border p-2 overflow-auto bg-surface">
    <DanxFileExplorer
      v-model:selected="selectedFolder"
      :nodes="tree"
      :folders-only="foldersOnly"
      default-expanded
    />
  </div>
  <p class="mt-3 text-sm text-text-subtle">Selected folder: {{ selectedFolder ?? "none" }}</p>
</template>
