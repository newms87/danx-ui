<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const value = ref("a");
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Charlie" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="value"
      :options="options"
      label="Error with message"
      error="Please select a valid option"
    />
    <DanxSelect v-model="value" :options="options" label="Error without message" :error="true" />
    <DanxSelect
      :options="options"
      label="With helper text"
      helper-text="Choose the option that best fits."
      placeholder="Select..."
    />
    <DanxSelect :options="options" label="Disabled" disabled model-value="a" />
    <DanxSelect :options="options" label="Readonly" readonly model-value="b" />
    <DanxSelect :options="options" label="Required" required placeholder="Required field" />
  </div>
</template>
