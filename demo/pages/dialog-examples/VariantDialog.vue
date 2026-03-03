<script setup>
import { ref } from "vue";
import { DanxButton, DanxDialog } from "danx-ui";

const showDanger = ref(false);
const showSuccess = ref(false);
const showWarning = ref(false);
</script>

<template>
  <div class="flex gap-4">
    <DanxButton variant="danger" @click="showDanger = true">Danger</DanxButton>
    <DanxButton variant="success" @click="showSuccess = true">Success</DanxButton>
    <DanxButton variant="warning" @click="showWarning = true">Warning</DanxButton>
  </div>

  <DanxDialog
    v-model="showDanger"
    title="Delete Item"
    variant="danger"
    close-button="Cancel"
    confirm-button="Delete"
  >
    <p>Are you sure you want to delete this item? This cannot be undone.</p>
  </DanxDialog>

  <DanxDialog v-model="showSuccess" title="Changes Saved" variant="success" close-button="Done">
    <p>Your changes have been saved successfully.</p>
  </DanxDialog>

  <DanxDialog
    v-model="showWarning"
    title="Unsaved Changes"
    variant="warning"
    close-button="Discard"
    confirm-button="Save"
  >
    <p>You have unsaved changes. Would you like to save before leaving?</p>
  </DanxDialog>
</template>
