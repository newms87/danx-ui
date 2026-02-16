<script setup lang="ts">
import { ref } from "vue";
import { DanxButtonGroup } from "danx-ui";

const selected = ref("overview");

const buttons = [
  { value: "overview", label: "Overview", icon: "document" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings", icon: "pencil" },
];
</script>

<template>
  <DanxButtonGroup v-model="selected" :buttons="buttons" />
  <p style="margin-top: 1rem; color: var(--color-text-muted)">Selected: {{ selected }}</p>
</template>
