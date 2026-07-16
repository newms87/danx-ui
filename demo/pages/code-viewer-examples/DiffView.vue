<script setup lang="ts">
import { ref } from "vue";
import { DanxCodeDiff } from "danx-ui";

const before = ref(`{
  "name": "widget",
  "version": "1.0.0",
  "config": {
    "theme": "dark",
    "retries": 3
  }
}`);

const after = ref(`{
  "name": "widget",
  "version": "1.1.0",
  "config": {
    "theme": "light",
    "retries": 3,
    "timeout": 30
  }
}`);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxCodeDiff :old-value="before" :new-value="after" format="json" label="Unified" />
    <DanxCodeDiff :old-value="before" :new-value="after" format="json" mode="split" label="Split" />
  </div>
</template>
