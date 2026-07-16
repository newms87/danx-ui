<script setup lang="ts">
import { ref } from "vue";
import { DanxCheckbox } from "danx-ui";

const checked = ref(true);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxCheckbox v-model="checked" size="sm">Small</DanxCheckbox>
    <DanxCheckbox v-model="checked" size="md">Medium (default)</DanxCheckbox>
    <DanxCheckbox v-model="checked" size="lg">Large</DanxCheckbox>
  </div>
</template>
