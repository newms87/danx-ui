<script setup>
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const activeTab = ref("overview");

const tabs = [
  { value: "overview", label: "Overview", icon: "list" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings", icon: "gear" },
];

const variants = ["", "danger", "success", "warning", "info", "muted"];
const selectedVariant = ref("danger");
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex gap-2 items-center">
      <span class="text-sm text-text-muted">Variant:</span>
      <select v-model="selectedVariant" class="border rounded px-2 py-1 text-sm">
        <option v-for="v in variants" :key="v" :value="v">{{ v || "(none)" }}</option>
      </select>
    </div>
    <DanxTabs v-model="activeTab" :tabs="tabs" :variant="selectedVariant" />
    <p class="text-text-muted text-sm">Active: {{ activeTab }}</p>
  </div>
</template>
