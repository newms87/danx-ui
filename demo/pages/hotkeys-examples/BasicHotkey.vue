<script setup>
import { ref } from "vue";
import { useHotkeys } from "danx-ui";

const message = ref("Press Mod+K");

useHotkeys("mod+k", (event) => {
  event.preventDefault();
  message.value = "Mod+K pressed!";
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm">{{ message }}</p>
    <p class="text-xs text-text-muted">
      Try it now — the listener is active on this page.
    </p>
  </div>
</template>
