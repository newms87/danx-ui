<script setup lang="ts">
import { ref } from "vue";
import { DanxTabs } from "danx-ui";

const activeTab = ref("day");

const tabs = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];
</script>

<template>
  <DanxTabs v-model="activeTab" :tabs="tabs" />
</template>
