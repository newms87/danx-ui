<script setup>
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const activeTab = ref("photos");

const tabs = [
  { value: "photos", label: "Photos", count: 24 },
  { value: "videos", label: "Videos", count: 8 },
  { value: "docs", label: "Documents", count: 156 },
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <p class="text-sm text-text-muted">Custom label slot with active styling:</p>
    <DanxTabs v-model="activeTab" :tabs="tabs">
      <template #label="{ tab, isActive }">
        <span :class="isActive ? 'font-bold uppercase' : 'font-normal'">
          {{ tab.label }}
        </span>
      </template>
    </DanxTabs>

    <p class="text-sm text-text-muted">Fully custom default slot:</p>
    <DanxTabs v-model="activeTab" :tabs="tabs">
      <template #default="{ tab, isActive }">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-xs opacity-60">{{ isActive ? "Viewing" : "View" }}</span>
          <span class="font-semibold">{{ tab.label }}</span>
        </div>
      </template>
    </DanxTabs>

    <p class="text-text-muted text-sm">Active: {{ activeTab }}</p>
  </div>
</template>
