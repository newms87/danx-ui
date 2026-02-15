<script setup lang="ts">
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const activeTab = ref("passed");

const tabs = [
  { value: "passed", label: "Passed", count: 42, activeColor: "#22c55e" },
  { value: "failed", label: "Failed", count: 3, activeColor: "#ef4444" },
  { value: "skipped", label: "Skipped", count: 7, activeColor: "#eab308" },
];
</script>

<template>
  <DanxTabs v-model="activeTab" :tabs="tabs" />
</template>
