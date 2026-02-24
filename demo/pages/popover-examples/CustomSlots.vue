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
      <DanxButton variant="info" @click="show = !show">Custom Styled</DanxButton>
    </template>
    <div class="p-4 max-w-64">
      <p class="font-semibold">Custom Appearance</p>
      <p class="mt-2 text-sm">
        This popover uses CSS token overrides for a distinct look.
      </p>
      <DanxButton size="sm" class="mt-3" @click="show = false">Close</DanxButton>
    </div>
  </DanxPopover>
</template>
