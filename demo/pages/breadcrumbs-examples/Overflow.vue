<script setup lang="ts">
import { DanxBreadcrumbs } from "danx-ui";

const items = [
  { label: "Home", href: "/" },
  { label: "Level 1", href: "/1" },
  { label: "Level 2", href: "/1/2" },
  { label: "Level 3", href: "/1/2/3" },
  { label: "Level 4", href: "/1/2/3/4" },
  { label: "Current" },
];
</script>

<template>
  <DanxBreadcrumbs :items="items" :max-items="4" />
</template>
