<script setup lang="ts">
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const activeTab = ref("all");

const tabs = [
  { value: "all", label: "All", count: 128 },
  { value: "active", label: "Active", count: 45 },
  { value: "archived", label: "Archived", count: 83 },
  { value: "empty", label: "Empty", count: 0 },
];
</script>

<template>
  <DanxTabs v-model="activeTab" :tabs="tabs" />
</template>
