<script setup lang="ts">
import { ref } from "vue";
import { DanxTooltip } from "danx-ui";

const isDisabled = ref(true);

function toggle() {
  isDisabled.value = !isDisabled.value;
}
</script>

<template>
  <div class="flex gap-8 items-center">
    <DanxTooltip :disabled="isDisabled" triggerIcon="info" tooltip="I only show when enabled" />
    <button class="px-4 py-2 border border-border rounded" @click="toggle">
      {{ isDisabled ? "Enable" : "Disable" }} tooltip
    </button>
  </div>
</template>
