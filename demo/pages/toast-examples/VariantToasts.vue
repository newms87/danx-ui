<script setup lang="ts">
import { useToast, DanxButton } from "danx-ui";

const { success, danger, warning, info, toast } = useToast();
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <DanxButton variant="muted" @click="toast('Default toast with no variant.')"
      >Default</DanxButton
    >
    <DanxButton variant="success" @click="success('Operation completed successfully!')"
      >Success</DanxButton
    >
    <DanxButton variant="danger" @click="danger('Something went wrong.')">Danger</DanxButton>
    <DanxButton variant="warning" @click="warning('Please review before proceeding.')"
      >Warning</DanxButton
    >
    <DanxButton variant="info" @click="info('Here is some useful information.')">Info</DanxButton>
  </div>
</template>
