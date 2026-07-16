<script setup lang="ts">
import { DanxButton, DanxDrawer, useDialog } from "danx-ui";

const drawer = useDialog();
</script>

<template>
  <DanxButton variant="info" @click="drawer.open()">Open Persistent Drawer</DanxButton>
  <DanxDrawer v-model="drawer.isOpen.value" title="Persistent Drawer" persistent>
    <p>ESC and backdrop clicks are disabled. Use the button below to close.</p>

    <template #footer>
      <DanxButton @click="drawer.close()">Close</DanxButton>
    </template>
  </DanxDrawer>
</template>
