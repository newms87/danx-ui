<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const sm = ref("a");
const md = ref("a");
const lg = ref("a");
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Charlie" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect v-model="sm" :options="options" size="sm" label="Small" />
    <DanxSelect v-model="md" :options="options" size="md" label="Medium (default)" />
    <DanxSelect v-model="lg" :options="options" size="lg" label="Large" />
  </div>
</template>
