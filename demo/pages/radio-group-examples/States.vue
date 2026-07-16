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
  <div class="flex flex-col gap-6">
    <DanxRadioGroup
      v-model="value"
      :options="options"
      label="Error with message"
      error="Please choose one"
    />
    <DanxRadioGroup
      v-model="value"
      :options="options"
      label="With helper text"
      helper-text="Pick your preferred option."
    />
    <DanxRadioGroup v-model="value" :options="options" label="Required" required />
  </div>
</template>
