<script setup lang="ts">
import { ref } from "vue";
import { DanxTextarea } from "danx-ui";

const text = ref("Type more lines to see the textarea grow automatically.\nAdd another line...");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxTextarea
      v-model="text"
      label="Auto-resize"
      auto-resize
      :rows="2"
      placeholder="Type to grow..."
    />
    <DanxTextarea label="Auto-resize (empty)" auto-resize :rows="3" placeholder="Start typing..." />
  </div>
</template>
