<script setup lang="ts">
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const customSizeDialog = useDialog();
</script>

<template>
  <DanxButton variant="info" @click="customSizeDialog.open()">Open Sized Dialog</DanxButton>
  <DanxDialog
    v-model="customSizeDialog.isOpen.value"
    title="Custom Size"
    :width="60"
    :height="50"
    close-button
  >
    <p>This dialog is 60vw × 50vh.</p>
    <p>Numbers become viewport units (vw/vh).</p>
    <p>Strings like "400px" or "30rem" pass through unchanged.</p>
  </DanxDialog>
</template>
