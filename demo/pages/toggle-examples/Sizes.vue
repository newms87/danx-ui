<script setup>
import { ref } from "vue";
import { DanxToggle } from "danx-ui";

const small = ref(false);
const medium = ref(true);
const large = ref(false);
</script>

<template>
  <div class="flex items-center gap-8">
    <div class="flex flex-col items-center gap-2">
      <DanxToggle v-model="small" size="sm" />
      <span class="text-xs text-text-muted">sm</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <DanxToggle v-model="medium" size="md" />
      <span class="text-xs text-text-muted">md (default)</span>
    </div>
    <div class="flex flex-col items-center gap-2">
      <DanxToggle v-model="large" size="lg" />
      <span class="text-xs text-text-muted">lg</span>
    </div>
  </div>
</template>
