<script setup lang="ts">
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const activeTab = ref("overview");

const tabs = [
  { value: "overview", label: "Overview", icon: "list" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings", icon: "gear" },
];
</script>

<template>
  <DanxTabs v-model="activeTab" :tabs="tabs" />
  <p class="mt-4 text-text-muted">Active: {{ activeTab }}</p>
</template>
