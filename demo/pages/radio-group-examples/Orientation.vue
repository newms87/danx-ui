<script setup lang="ts">
import { ref } from "vue";
import { DanxRadioGroup } from "danx-ui";

const size = ref("md");

const options = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <DanxRadioGroup v-model="size" :options="options" label="Vertical (default)" />
    <DanxRadioGroup v-model="size" :options="options" orientation="horizontal" label="Horizontal" />
  </div>
</template>
