<script setup lang="ts">
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const subtitleDialog = useDialog();
</script>

<template>
  <DanxButton variant="info" @click="subtitleDialog.open()">Open Dialog</DanxButton>
  <DanxDialog
    v-model="subtitleDialog.isOpen.value"
    title="Important Notice"
    subtitle="Please read carefully"
  >
    <p>This dialog has both a title and subtitle in the header.</p>
  </DanxDialog>
</template>
