<script setup lang="ts">
import { ref } from "vue";
import { DanxCheckbox } from "danx-ui";

const value = ref(false);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxCheckbox v-model="value" label="Error with message" error="You must accept the terms" />
    <DanxCheckbox v-model="value" label="Error without message" :error="true" />
    <DanxCheckbox v-model="value" label="With helper text" helper-text="Optional, but recommended." />
    <DanxCheckbox v-model="value" label="Disabled" disabled />
    <DanxCheckbox v-model="value" label="Readonly" readonly />
    <DanxCheckbox v-model="value" label="Required" required />
  </div>
</template>
