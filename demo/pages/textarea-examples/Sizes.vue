<script setup lang="ts">
import { DanxTextarea } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxTextarea label="Small" size="sm" placeholder="Small textarea" />
    <DanxTextarea label="Medium (default)" size="md" placeholder="Medium textarea" />
    <DanxTextarea label="Large" size="lg" placeholder="Large textarea" />
  </div>
</template>
