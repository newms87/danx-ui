<script setup lang="ts">
import { DanxEmptyState } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxEmptyState size="sm" icon="search" title="No results" />
    <DanxEmptyState size="md" icon="search" title="No results" />
    <DanxEmptyState size="lg" icon="search" title="No results" />

    <DanxEmptyState title="Nothing to see here">
      <template #illustration>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 10h.01M15 10h.01M8 15c1.5 1.5 6.5 1.5 8 0" />
        </svg>
      </template>
    </DanxEmptyState>
  </div>
</template>
