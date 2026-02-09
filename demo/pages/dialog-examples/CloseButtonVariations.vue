<script setup lang="ts">
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const closeButtonBool = useDialog();
const closeButtonCustom = useDialog();
</script>

<template>
  <DanxButton type="info" @click="closeButtonBool.open()">Default Close</DanxButton>
  <DanxButton type="info" @click="closeButtonCustom.open()">Custom Close</DanxButton>

  <DanxDialog v-model="closeButtonBool.isOpen.value" title="Close Button" close-button>
    <p>This dialog has a close button with default "Close" text.</p>
  </DanxDialog>

  <DanxDialog v-model="closeButtonCustom.isOpen.value" title="Custom Close" close-button="Cancel">
    <p>This dialog has a close button with custom "Cancel" text.</p>
  </DanxDialog>
</template>
