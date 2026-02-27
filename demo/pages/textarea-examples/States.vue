<script setup lang="ts">
import { ref } from "vue";
import { DanxTextarea } from "danx-ui";

const value = ref("Some value");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxTextarea v-model="value" label="Error with message" error="This field is required" />
    <DanxTextarea v-model="value" label="Error without message" :error="true" />
    <DanxTextarea
      label="With helper text"
      helper-text="Maximum 500 characters."
      placeholder="Enter text..."
    />
    <DanxTextarea label="Disabled" disabled model-value="Cannot edit this" />
    <DanxTextarea label="Readonly" readonly model-value="Read only content" />
    <DanxTextarea label="Required" required placeholder="Required field" />
  </div>
</template>
