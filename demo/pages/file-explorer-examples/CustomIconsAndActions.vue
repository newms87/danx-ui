<script setup lang="ts">
import { ref } from "vue";
import { DanxFileExplorer, DanxBadge, DanxButton, DanxIcon } from "danx-ui";

const tree = [
  {
    id: "project",
    name: "Project",
    icon: "database",
    children: [
      { id: "schema.sql", name: "schema.sql", icon: "code", meta: { status: "edited" } },
      { id: "seed.json", name: "seed.json", icon: "gear" },
      { id: "notes.md", name: "notes.md", icon: "document", disabled: true },
    ],
  },
  { id: "report.pdf", name: "report.pdf", icon: "file-pdf", meta: { status: "new" } },
];

const selected = ref("schema.sql");

function logDownload(node) {
  // eslint-disable-next-line no-console
  console.log("[FileExplorer] download", node.name);
}
</script>

<template>
  <div class="h-[300px] w-80 rounded-lg border border-border p-2 overflow-auto bg-surface">
    <DanxFileExplorer v-model:selected="selected" :nodes="tree" default-expanded>
      <template #node="{ node }">
        <DanxIcon :icon="node.icon || 'file'" class="danx-file-explorer-node__icon" />
        <span class="flex-1 truncate">{{ node.name }}</span>
        <DanxBadge v-if="node.meta?.status" variant="info" size="sm">
          {{ node.meta.status }}
        </DanxBadge>
      </template>

      <template #actions="{ node, isFolder }">
        <DanxButton v-if="!isFolder" size="xs" variant="muted" @click.stop="logDownload(node)">
          <DanxIcon icon="download" class="w-3 h-3" />
        </DanxButton>
      </template>
    </DanxFileExplorer>
  </div>
</template>
