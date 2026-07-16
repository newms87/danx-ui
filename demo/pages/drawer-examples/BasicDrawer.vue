<script setup lang="ts">
import { DanxButton, DanxDrawer, useDialog } from "danx-ui";

const drawer = useDialog();
</script>

<template>
  <DanxButton variant="info" @click="drawer.open()">Open Drawer</DanxButton>
  <DanxDrawer v-model="drawer.isOpen.value" title="Basic Drawer">
    <p>This is a basic drawer sliding in from the right edge.</p>
  </DanxDrawer>
</template>
