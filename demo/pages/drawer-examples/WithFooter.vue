<script setup lang="ts">
import { DanxButton, DanxDrawer, useDialog } from "danx-ui";

const drawer = useDialog();
</script>

<template>
  <DanxButton variant="info" @click="drawer.open()">Open Filter Panel</DanxButton>
  <DanxDrawer v-model="drawer.isOpen.value" title="Filters">
    <p>Filter controls go here.</p>

    <template #footer>
      <DanxButton @click="drawer.close()">Cancel</DanxButton>
      <DanxButton variant="info" @click="drawer.close()">Apply</DanxButton>
    </template>
  </DanxDrawer>
</template>
