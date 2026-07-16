<script setup lang="ts">
import { DanxBreadcrumbs } from "danx-ui";

const items = [
  { label: "Home", href: "/", icon: "list" },
  { label: "Settings", href: "/settings", icon: "gear" },
  { label: "Profile", icon: "edit" },
];
</script>

<template>
  <DanxBreadcrumbs :items="items" />
</template>
