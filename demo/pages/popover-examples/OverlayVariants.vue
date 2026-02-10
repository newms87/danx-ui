<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxPopover } from "danx-ui";

const showBottom = ref(false);
const showTop = ref(false);
const showLeft = ref(false);
const showRight = ref(false);
</script>

<template>
  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; padding: 3rem 0">
    <DanxPopover v-model="showBottom" placement="bottom">
      <template #trigger>
        <DanxButton type="info" @click="showBottom = !showBottom">Bottom</DanxButton>
      </template>
      <div style="padding: 0.75rem 1rem; white-space: nowrap">Panel below trigger</div>
    </DanxPopover>

    <DanxPopover v-model="showTop" placement="top">
      <template #trigger>
        <DanxButton type="info" @click="showTop = !showTop">Top</DanxButton>
      </template>
      <div style="padding: 0.75rem 1rem; white-space: nowrap">Panel above trigger</div>
    </DanxPopover>

    <DanxPopover v-model="showLeft" placement="left">
      <template #trigger>
        <DanxButton type="info" @click="showLeft = !showLeft">Left</DanxButton>
      </template>
      <div style="padding: 0.75rem 1rem; white-space: nowrap">Panel to the left</div>
    </DanxPopover>

    <DanxPopover v-model="showRight" placement="right">
      <template #trigger>
        <DanxButton type="info" @click="showRight = !showRight">Right</DanxButton>
      </template>
      <div style="padding: 0.75rem 1rem; white-space: nowrap">Panel to the right</div>
    </DanxPopover>
  </div>
</template>
