<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxDialog, useDialog } from "danx-ui";

const animatedSizeDialog = useDialog();
const dialogSize = ref("small");
const sizeMap = {
  small: { width: 400, height: 200 },
  medium: { width: 500, height: 300 },
  large: { width: 700, height: 450 },
};
</script>

<template>
  <DanxButton type="info" @click="animatedSizeDialog.open()">Open Animated Dialog</DanxButton>
  <DanxDialog
    v-model="animatedSizeDialog.isOpen.value"
    title="Animated Size"
    :width="`${sizeMap[dialogSize].width}px`"
    :height="`${sizeMap[dialogSize].height}px`"
    close-x
  >
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem">
      <DanxButton
        :type="dialogSize === 'small' ? 'info' : 'muted'"
        size="sm"
        @click="dialogSize = 'small'"
      >
        Small
      </DanxButton>
      <DanxButton
        :type="dialogSize === 'medium' ? 'info' : 'muted'"
        size="sm"
        @click="dialogSize = 'medium'"
      >
        Medium
      </DanxButton>
      <DanxButton
        :type="dialogSize === 'large' ? 'info' : 'muted'"
        size="sm"
        @click="dialogSize = 'large'"
      >
        Large
      </DanxButton>
    </div>
    <p>Click the buttons to resize. Uses CSS <code>interpolate-size</code>.</p>
  </DanxDialog>
</template>
