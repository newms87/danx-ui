<script setup lang="ts">
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const slotDialog = useDialog();
</script>

<template>
  <DanxButton type="info" @click="slotDialog.open()">Open Custom Dialog</DanxButton>
  <DanxDialog v-model="slotDialog.isOpen.value">
    <template #title>
      <span style="color: #0077cc">🎨 Custom Title</span>
    </template>
    <template #subtitle>
      <em>Styled subtitle via slot</em>
    </template>
    <p>The title and subtitle are customized using named slots.</p>
    <template #actions>
      <DanxButton @click="slotDialog.close()">Custom Close Button</DanxButton>
    </template>
  </DanxDialog>
</template>
