<script setup lang="ts">
import { DanxAuditHistoryItem } from "danx-ui";
</script>

<template>
  <DanxAuditHistoryItem
    :entry="{
      actor: 'Jane Doe',
      timestamp: Date.now(),
      action: 'update',
      field: 'status',
      oldValue: 'Draft',
      newValue: 'Published',
    }"
  />
</template>
