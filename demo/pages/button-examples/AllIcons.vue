<script setup lang="ts">
import { buttonIcons } from "danx-ui";

const iconNames = Object.keys(buttonIcons);
</script>

<template>
  <DanxButton v-for="name in iconNames" :key="name" :icon="name" :tooltip="name" />
</template>
