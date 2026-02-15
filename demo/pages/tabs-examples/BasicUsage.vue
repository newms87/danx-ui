<script setup lang="ts">
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const activeTab = ref("overview");

const tabs = [
  { value: "overview", label: "Overview", icon: "list" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings", icon: "handle" },
];
</script>

<template>
  <DanxTabs v-model="activeTab" :tabs="tabs" />
  <p style="margin-top: 1rem; color: var(--color-text-muted)">Active: {{ activeTab }}</p>
</template>
