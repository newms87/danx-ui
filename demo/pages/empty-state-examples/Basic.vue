<script setup lang="ts">
import { DanxEmptyState } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxEmptyState title="No results" />
    <DanxEmptyState icon="search" title="No results" description="Try a different search term." />
  </div>
</template>
