<script setup lang="ts">
import { DanxTable } from "danx-ui";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
];
</script>

<template>
  <DanxTable :columns="columns" :rows="[]" row-key="id">
    <template #empty>No users found.</template>
  </DanxTable>
</template>
