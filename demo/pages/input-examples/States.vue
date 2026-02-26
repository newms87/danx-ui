<script setup lang="ts">
import { ref } from "vue";
import { DanxInput } from "danx-ui";

const value = ref("Some value");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput v-model="value" label="Error with message" error="This field is required" />
    <DanxInput v-model="value" label="Error without message" :error="true" />
    <DanxInput
      label="With helper text"
      helper-text="We'll never share your email."
      placeholder="you@example.com"
    />
    <DanxInput label="Disabled" disabled model-value="Cannot edit" />
    <DanxInput label="Readonly" readonly model-value="Read only value" />
    <DanxInput label="Required" required placeholder="Required field" />
  </div>
</template>
