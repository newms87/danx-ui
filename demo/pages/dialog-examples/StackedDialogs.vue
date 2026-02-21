<script setup lang="ts">
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const firstDialog = useDialog();
const secondDialog = useDialog();
const thirdDialog = useDialog();
</script>

<template>
  <DanxButton type="info" @click="firstDialog.open()">Open First Dialog</DanxButton>

  <DanxDialog v-model="firstDialog.isOpen.value" title="First Dialog" close-x>
    <p>This is the first dialog. Click the button below to open a second dialog on top.</p>
    <p>The first dialog stays mounted (preserving state) but is hidden behind the second.</p>
    <DanxButton type="info" @click="secondDialog.open()">Open Second Dialog</DanxButton>
  </DanxDialog>

  <DanxDialog v-model="secondDialog.isOpen.value" title="Second Dialog" close-x>
    <p>This is the second dialog. Notice the breadcrumbs above showing the navigation stack.</p>
    <p>You can click "First Dialog" in the breadcrumbs to go back, or open a third dialog.</p>
    <DanxButton type="info" @click="thirdDialog.open()">Open Third Dialog</DanxButton>
  </DanxDialog>

  <DanxDialog v-model="thirdDialog.isOpen.value" title="Third Dialog" close-x>
    <p>Three dialogs deep! The breadcrumbs show the full navigation path.</p>
    <p>Click any breadcrumb to navigate back to that dialog, closing all above it.</p>
  </DanxDialog>
</template>
