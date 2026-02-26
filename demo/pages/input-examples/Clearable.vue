<script setup lang="ts">
import { ref } from "vue";
import { DanxInput } from "danx-ui";

const text = ref("Clear me!");
const search = ref("Search is clearable by default");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput v-model="text" label="Clearable text" clearable />
    <DanxInput v-model="search" label="Search (auto clearable)" type="search" />
    <p class="text-sm text-slate-500">Text: "{{ text }}" | Search: "{{ search }}"</p>
  </div>
</template>
