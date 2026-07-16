<script setup lang="ts">
import { ref } from "vue";
import { DanxRadioGroup } from "danx-ui";

const value = ref("a");

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxRadioGroup v-model="value" :options="options" size="sm" />
    <DanxRadioGroup v-model="value" :options="options" size="md" />
    <DanxRadioGroup v-model="value" :options="options" size="lg" />
  </div>
</template>
