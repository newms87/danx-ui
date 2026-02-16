<script setup lang="ts">
import { ref } from "vue";
import { DanxButtonGroup } from "danx-ui";

const selected = ref(["bug"]);

const buttons = [
  { value: "bug", label: "Bug", count: 12 },
  { value: "feature", label: "Feature", count: 5 },
  { value: "docs", label: "Docs", count: 3 },
  { value: "chore", label: "Chore", count: 8 },
];
</script>

<template>
  <DanxButtonGroup v-model="selected" :buttons="buttons" multiple />
  <p style="margin-top: 1rem; color: var(--color-text-muted)">Selected: {{ selected }}</p>
</template>
