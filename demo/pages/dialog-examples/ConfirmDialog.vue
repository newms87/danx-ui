<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const confirmDialog = useDialog();
const isSaving = ref(false);

async function handleConfirm() {
  isSaving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isSaving.value = false;
  confirmDialog.close();
}
</script>

<template>
  <DanxButton variant="info" @click="confirmDialog.open()">Open Confirm Dialog</DanxButton>
  <DanxDialog
    v-model="confirmDialog.isOpen.value"
    title="Confirm Action"
    close-button="Cancel"
    confirm-button="Save Changes"
    :is-saving="isSaving"
    @confirm="handleConfirm"
  >
    <p>Click "Save Changes" to see the loading state.</p>
  </DanxDialog>
</template>
