<script setup lang="ts">
import { DanxChip } from "danx-ui";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
    <DanxChip auto-color label="Pending" />
    <DanxChip auto-color label="In Review" />
    <DanxChip auto-color label="Approved" />
    <DanxChip auto-color label="Rejected" />
    <DanxChip auto-color label="Draft" />
    <DanxChip auto-color label="Published" />
    <DanxChip auto-color label="Archived" />
    <DanxChip auto-color label="Cancelled" />
    <DanxChip auto-color label="On Hold" />
    <DanxChip auto-color label="Active" />
    <DanxChip auto-color label="Completed" />
    <DanxChip auto-color label="Scheduled" />
  </div>

  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem">
    <DanxChip auto-color="category-a" label="Display A" />
    <DanxChip auto-color="category-b" label="Display B" />
    <DanxChip auto-color="category-a" label="Same Key as A" />
  </div>
</template>
