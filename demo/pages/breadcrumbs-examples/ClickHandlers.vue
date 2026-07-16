<script setup lang="ts">
import { ref, computed } from "vue";
import { DanxBreadcrumbs } from "danx-ui";

const path = ref(["Root", "Folder A", "Folder B"]);

function navigateTo(index) {
  path.value = path.value.slice(0, index + 1);
}

const items = computed(() =>
  path.value.map((label, index) => ({
    label,
    onClick: index < path.value.length - 1 ? () => navigateTo(index) : undefined,
  }))
);
</script>

<template>
  <DanxBreadcrumbs :items="items" />
  <p class="mt-4 text-text-muted">Click a breadcrumb to truncate the path.</p>
</template>
