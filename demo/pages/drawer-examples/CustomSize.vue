<script setup lang="ts">
import { DanxButton, DanxDrawer, useDialog } from "danx-ui";

const drawer = useDialog();
</script>

<template>
  <DanxButton variant="info" @click="drawer.open()">Open Wide Drawer</DanxButton>
  <DanxDrawer v-model="drawer.isOpen.value" title="Wide Drawer" size="480px">
    <p>This drawer has a fixed 480px width.</p>
  </DanxDrawer>
</template>
