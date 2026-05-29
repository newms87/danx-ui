<script setup lang="ts">
import { ref } from "vue";
import { DanxSplitPanel, DanxFileExplorer, DanxScroll, DanxIcon } from "danx-ui";

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
          { id: "FileExplorer.vue", name: "FileExplorer.vue" },
        ],
      },
      {
        id: "composables",
        name: "composables",
        children: [{ id: "useFileExplorer.ts", name: "useFileExplorer.ts" }],
      },
      { id: "index.ts", name: "index.ts" },
    ],
  },
  { id: "package.json", name: "package.json" },
];

const selected = ref("index.ts");
</script>

<template>
  <DanxSplitPanel
    :panels="[
      { id: 'files', label: 'Files', defaultWidth: 32 },
      { id: 'editor', label: 'Editor', defaultWidth: 68 },
    ]"
    class="h-[420px] rounded-xl border border-border overflow-hidden shadow"
  >
    <template #files>
      <div class="h-full flex flex-col bg-surface">
        <div class="px-3 py-2 border-b border-border flex items-center gap-2 text-sm font-medium">
          <DanxIcon icon="folder" class="w-4 h-4" />
          Explorer
        </div>
        <DanxScroll class="flex-1 p-1">
          <DanxFileExplorer v-model:selected="selected" :nodes="tree" default-expanded />
        </DanxScroll>
      </div>
    </template>

    <template #editor>
      <div class="h-full flex items-center justify-center text-text-subtle">
        <div class="text-center">
          <DanxIcon icon="file" class="w-10 h-10 mx-auto mb-2 opacity-50" />
          <div class="text-sm">
            Editing: <span class="font-mono">{{ selected ?? "—" }}</span>
          </div>
        </div>
      </div>
    </template>
  </DanxSplitPanel>
</template>
