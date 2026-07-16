<script setup lang="ts">
import { DanxBreadcrumbs, DanxIcon } from "danx-ui";

const items = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "danx-ui" },
];
</script>

<template>
  <DanxBreadcrumbs :items="items">
    <template #separator>
      <DanxIcon icon="chevron-right" />
    </template>
  </DanxBreadcrumbs>
</template>
