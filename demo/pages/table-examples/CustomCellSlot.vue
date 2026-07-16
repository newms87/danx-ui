<script setup lang="ts">
import { DanxTable } from "danx-ui";

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
];

const users = [
  { id: "1", name: "Alice", role: "Admin" },
  { id: "2", name: "Bob", role: "Member" },
];
</script>

<template>
  <DanxTable :columns="columns" :rows="users" row-key="id">
    <template #cell-role="{ value }">
      <span class="rounded-full bg-surface-sunken px-2 py-0.5 text-xs">{{ value }}</span>
    </template>
  </DanxTable>
</template>
