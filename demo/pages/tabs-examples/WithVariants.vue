<script setup>
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const tabs = [
  { value: "overview", label: "Overview", icon: "list" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings", icon: "gear" },
];

const variants = ["danger", "success", "warning", "info", "muted"];
const activeTabs = ref(Object.fromEntries(variants.map((v) => [v, "overview"])));
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="v in variants" :key="v" class="flex flex-col gap-1">
      <span class="text-xs font-mono text-text-muted">{{ v }}</span>
      <DanxTabs v-model="activeTabs[v]" :tabs="tabs" :variant="v" />
    </div>
  </div>
</template>
