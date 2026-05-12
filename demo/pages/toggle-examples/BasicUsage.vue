<script setup>
import { ref } from "vue";
import { DanxToggle } from "danx-ui";

const enabled = ref(false);
</script>

<template>
  <div class="flex items-center gap-4">
    <DanxToggle v-model="enabled" />
    <span class="text-sm text-text-muted">State: {{ enabled ? "On" : "Off" }}</span>
  </div>
</template>
