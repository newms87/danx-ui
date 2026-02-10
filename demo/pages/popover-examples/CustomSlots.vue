<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxPopover } from "danx-ui";

const show = ref(false);
</script>

<template>
  <DanxPopover
    v-model="show"
    style="
      --dx-popover-bg: #1a1a2e;
      --dx-popover-border: #7c3aed;
      --dx-popover-text: #e2e8f0;
      --dx-popover-border-radius: 1rem;
      --dx-popover-shadow: rgb(124 58 237 / 0.3);
    "
  >
    <template #trigger>
      <DanxButton type="info" @click="show = !show">Custom Styled</DanxButton>
    </template>
    <div style="padding: 1rem; max-width: 16rem">
      <p style="margin: 0; font-weight: 600">Custom Appearance</p>
      <p style="margin: 0.5rem 0 0; font-size: 0.875rem">
        This popover uses CSS token overrides for a distinct look.
      </p>
      <DanxButton size="sm" style="margin-top: 0.75rem" @click="show = false">Close</DanxButton>
    </div>
  </DanxPopover>
</template>
