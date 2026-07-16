<script setup lang="ts">
import { DanxBreadcrumbs } from "danx-ui";

const items = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "danx-ui" },
];
</script>

<template>
  <DanxBreadcrumbs :items="items" separator=">" />
</template>
