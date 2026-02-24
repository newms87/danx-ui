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
      <DanxButton variant="info" @click="show = !show">Edit Settings</DanxButton>
    </template>
    <div
      class="p-4 flex flex-col gap-3 min-w-64"
    >
      <h4 class="font-semibold">Settings</h4>
      <label class="flex flex-col gap-1 text-sm">
        Name
        <input
          v-model="name"
          type="text"
          class="px-2 py-1 border border-color-border rounded-sm bg-color-surface text-color-text"
        />
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="enabled" type="checkbox" />
        Enabled
      </label>
      <div class="flex justify-end gap-2 pt-1">
        <DanxButton size="sm" @click="show = false">Cancel</DanxButton>
        <DanxButton size="sm" variant="info" @click="save">Save</DanxButton>
      </div>
    </div>
  </DanxPopover>
</template>
