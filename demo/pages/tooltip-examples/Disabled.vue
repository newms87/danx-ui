<script setup lang="ts">
import { ref } from "vue";
import { DanxTooltip } from "danx-ui";

const isDisabled = ref(true);

function toggle() {
  isDisabled.value = !isDisabled.value;
}
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <DanxTooltip :disabled="isDisabled" triggerIcon="info" tooltip="I only show when enabled" />
    <button
      style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 0.25rem"
      @click="toggle"
    >
      {{ isDisabled ? "Enable" : "Disable" }} tooltip
    </button>
  </div>
</template>
