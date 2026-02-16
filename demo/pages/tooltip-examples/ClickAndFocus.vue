<script setup lang="ts">
import { DanxTooltip } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: center">
    <DanxTooltip interaction="click" tooltip="Click to toggle this tooltip">
      <template #trigger>
        <button style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 0.25rem">
          Click me
        </button>
      </template>
    </DanxTooltip>

    <DanxTooltip interaction="focus" tooltip="Focus the input to see this tooltip">
      <template #trigger>
        <input
          type="text"
          placeholder="Focus me"
          style="padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem"
        />
      </template>
    </DanxTooltip>
  </div>
</template>
