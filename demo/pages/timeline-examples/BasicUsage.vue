<script setup lang="ts">
import { DanxTimeline } from "danx-ui";

const entries = [
  { type: "success", timestamp: "2 minutes ago", content: "Deployment succeeded" },
  { type: "info", timestamp: "10 minutes ago", content: "Build started" },
  { type: "default", timestamp: "1 hour ago", content: "Commit pushed to main" },
];
</script>

<template>
  <DanxTimeline :items="entries" />
</template>
