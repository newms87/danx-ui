<script setup lang="ts">
import { DanxAuditHistoryItem } from "danx-ui";
</script>

<template>
  <DanxAuditHistoryItem
    :entry="{
      actor: 'Jane Doe',
      timestamp: Date.now(),
      action: 'create',
      description: 'created this record',
    }"
  />
</template>
