<script setup lang="ts">
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const basicDialog = useDialog();
</script>

<template>
  <DanxButton variant="info" @click="basicDialog.open()">Open Basic Dialog</DanxButton>
  <DanxDialog v-model="basicDialog.isOpen.value" title="Basic Dialog" close-x>
    <p>This is a basic dialog with an X close button in the top right.</p>
  </DanxDialog>
</template>
