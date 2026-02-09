<script setup lang="ts">
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const persistentDialog = useDialog();
</script>

<template>
  <DanxButton type="info" @click="persistentDialog.open()">Open Persistent</DanxButton>
  <DanxDialog
    v-model="persistentDialog.isOpen.value"
    title="Persistent Dialog"
    subtitle="You must use the button to close"
    persistent
    close-button="I Understand"
  >
    <p>Try pressing ESC or clicking the backdrop - it won't close!</p>
    <p>Only the close button works.</p>
  </DanxDialog>
</template>
