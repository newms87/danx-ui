<script setup lang="ts">
import { DanxInput } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput label="Small" size="sm" placeholder="Small input" />
    <DanxInput label="Medium (default)" size="md" placeholder="Medium input" />
    <DanxInput label="Large" size="lg" placeholder="Large input" />
  </div>
</template>
