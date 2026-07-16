<script setup lang="ts">
import { ref } from "vue";
import { DanxTreeView, DanxBadge, DanxIcon } from "danx-ui";

const tree = [
  {
    id: "org",
    label: "Acme Corp",
    icon: "database",
    data: { headcount: 240 },
    children: [
      { id: "eng", label: "Engineering", icon: "code", data: { headcount: 80 } },
      { id: "sales", label: "Sales", icon: "users", data: { headcount: 40, hot: true } },
    ],
  },
];

const selected = ref("eng");
</script>

<template>
  <div class="h-[220px] w-80 rounded-lg border border-border p-2 overflow-auto bg-surface">
    <DanxTreeView v-model:selected="selected" :nodes="tree" default-expanded>
      <template #node="{ node }">
        <DanxIcon :icon="node.icon ?? 'folder'" class="danx-tree-view-node__icon" />
        <span class="flex-1 truncate">{{ node.label }}</span>
        <DanxBadge v-if="node.data?.hot" variant="warning" size="sm">hot</DanxBadge>
        <span class="text-xs text-text-subtle">{{ node.data?.headcount }}</span>
      </template>
    </DanxTreeView>
  </div>
</template>
