<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxPopover } from "danx-ui";

const show = ref(false);
const name = ref("Widget");
const enabled = ref(true);

function save() {
  show.value = false;
}
</script>

<template>
  <DanxPopover v-model="show">
    <template #trigger>
      <DanxButton type="info" @click="show = !show">Edit Settings</DanxButton>
    </template>
    <div
      style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; min-width: 16rem"
    >
      <h4 style="margin: 0; font-weight: 600">Settings</h4>
      <label style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.875rem">
        Name
        <input
          v-model="name"
          type="text"
          style="
            padding: 0.375rem 0.5rem;
            border: 1px solid var(--color-border);
            border-radius: 0.25rem;
            background: var(--color-surface);
            color: var(--color-text);
          "
        />
      </label>
      <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem">
        <input v-model="enabled" type="checkbox" />
        Enabled
      </label>
      <div style="display: flex; justify-content: flex-end; gap: 0.5rem; padding-top: 0.25rem">
        <DanxButton size="sm" @click="show = false">Cancel</DanxButton>
        <DanxButton size="sm" type="info" @click="save">Save</DanxButton>
      </div>
    </div>
  </DanxPopover>
</template>
