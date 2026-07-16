<script setup lang="ts">
import { DanxEmptyState, DanxButton } from "danx-ui";
</script>

<template>
  <DanxEmptyState
    icon="folder"
    title="No files yet"
    description="Upload your first file to get started."
  >
    <template #actions>
      <DanxButton variant="success">Upload a file</DanxButton>
    </template>
  </DanxEmptyState>
</template>
