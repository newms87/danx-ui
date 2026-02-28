<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const values = ref({
  danger: null,
  success: null,
  warning: null,
  info: null,
  muted: null,
});
const options = [
  { value: "one", label: "Option One" },
  { value: "two", label: "Option Two" },
  { value: "three", label: "Option Three" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect
      v-model="values.danger"
      :options="options"
      variant="danger"
      label="Danger"
      placeholder="Select..."
    />
    <DanxSelect
      v-model="values.success"
      :options="options"
      variant="success"
      label="Success"
      placeholder="Select..."
    />
    <DanxSelect
      v-model="values.warning"
      :options="options"
      variant="warning"
      label="Warning"
      placeholder="Select..."
    />
    <DanxSelect
      v-model="values.info"
      :options="options"
      variant="info"
      label="Info"
      placeholder="Select..."
    />
    <DanxSelect
      v-model="values.muted"
      :options="options"
      variant="muted"
      label="Muted"
      placeholder="Select..."
    />
  </div>
</template>
