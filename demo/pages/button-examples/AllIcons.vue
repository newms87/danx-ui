<script setup lang="ts">
import { iconRegistry } from "danx-ui";

const iconNames = Object.keys(iconRegistry);
</script>

<template>
  <DanxButton v-for="name in iconNames" :key="name" :icon="name" :tooltip="name" />
</template>
