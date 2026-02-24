<script setup lang="ts">
import { ref } from "vue";
import { DanxPopover } from "danx-ui";

const show = ref(false);
</script>

<template>
  <DanxPopover v-model="show">
    <template #trigger>
      <button class="demo-btn" @click="show = !show">Toggle Popover</button>
    </template>
    <div class="px-4 py-3 max-w-56">
      <p class="m-0">This is a basic popover anchored below the trigger button.</p>
      <p class="mt-2 text-text-muted text-[0.8125rem]">
        Click outside or press Escape to close.
      </p>
    </div>
  </DanxPopover>
</template>
