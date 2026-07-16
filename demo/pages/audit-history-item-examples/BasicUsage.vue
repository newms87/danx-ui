<script setup lang="ts">
import { DanxAuditHistoryItem } from "danx-ui";

const entries = [
  {
    actor: "Jane Doe",
    timestamp: Date.now(),
    action: "create",
    description: "created this record",
  },
  {
    actor: "John Smith",
    timestamp: Date.now() - 5 * 60 * 1000,
    action: "update",
    field: "status",
    oldValue: "Draft",
    newValue: "Published",
  },
  {
    actor: "Jane Doe",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    action: "delete",
    description: "deleted attachment invoice.pdf",
  },
];
</script>

<template>
  <ul style="list-style: none; padding: 0; margin: 0">
    <li v-for="(entry, i) in entries" :key="i">
      <DanxAuditHistoryItem :entry="entry" />
    </li>
  </ul>
</template>
