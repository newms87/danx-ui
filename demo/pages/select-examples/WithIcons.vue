<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";
import { codeIcon, gearIcon, musicIcon, infoIcon } from "danx-ui";

const selected = ref(null);
const options = [
  { value: "code", label: "Code", icon: codeIcon },
  { value: "settings", label: "Settings", icon: gearIcon },
  { value: "music", label: "Music", icon: musicIcon },
  { value: "info", label: "Information", icon: infoIcon },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="selected"
      :options="options"
      label="With Icons"
      placeholder="Choose an item"
    />
    <p class="text-sm text-slate-500">Selected: {{ selected ?? "(none)" }}</p>
  </div>
</template>
