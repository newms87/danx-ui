<script setup lang="ts">
import { DanxTimeline } from "danx-ui";

const entries = [
  { type: "success", timestamp: "Just now", content: "Order shipped" },
  { type: "warning", timestamp: "5 minutes ago", content: "Payment retry scheduled" },
  { type: "error", timestamp: "20 minutes ago", content: "Payment failed" },
  { type: "info", timestamp: "1 hour ago", content: "Order placed" },
];
</script>

<template>
  <DanxTimeline :items="entries" />
</template>
