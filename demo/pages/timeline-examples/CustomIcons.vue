<script setup lang="ts">
import { DanxTimeline } from "danx-ui";

const entries = [
  { type: "success", icon: "confirm", timestamp: "Just now", content: "Request approved" },
  { type: "error", icon: "close", timestamp: "10 minutes ago", content: "Request rejected" },
  { type: "default", timestamp: "1 day ago", content: "Request submitted" },
];
</script>

<template>
  <DanxTimeline :items="entries" />
</template>
