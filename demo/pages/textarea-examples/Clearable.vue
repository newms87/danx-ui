<script setup lang="ts">
import { ref } from "vue";
import { DanxTextarea } from "danx-ui";

const text = ref("Click the X to clear me!");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxTextarea v-model="text" label="Clearable textarea" clearable />
    <p class="text-sm text-slate-500">Value: "{{ text }}"</p>
  </div>
</template>
