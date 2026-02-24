<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxPopover } from "danx-ui";

const showBottom = ref(false);
const showTop = ref(false);
const showLeft = ref(false);
const showRight = ref(false);
</script>

<template>
  <div class="flex gap-3 flex-wrap py-12">
    <DanxPopover v-model="showBottom" placement="bottom">
      <template #trigger>
        <DanxButton variant="info" @click="showBottom = !showBottom">Bottom</DanxButton>
      </template>
      <div class="px-4 py-3 whitespace-nowrap">Panel below trigger</div>
    </DanxPopover>

    <DanxPopover v-model="showTop" placement="top">
      <template #trigger>
        <DanxButton variant="info" @click="showTop = !showTop">Top</DanxButton>
      </template>
      <div class="px-4 py-3 whitespace-nowrap">Panel above trigger</div>
    </DanxPopover>

    <DanxPopover v-model="showLeft" placement="left">
      <template #trigger>
        <DanxButton variant="info" @click="showLeft = !showLeft">Left</DanxButton>
      </template>
      <div class="px-4 py-3 whitespace-nowrap">Panel to the left</div>
    </DanxPopover>

    <DanxPopover v-model="showRight" placement="right">
      <template #trigger>
        <DanxButton variant="info" @click="showRight = !showRight">Right</DanxButton>
      </template>
      <div class="px-4 py-3 whitespace-nowrap">Panel to the right</div>
    </DanxPopover>
  </div>
</template>
