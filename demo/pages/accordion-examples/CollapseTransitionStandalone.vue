<script setup>
import { ref } from "vue";
import { DanxButton, CollapseTransition } from "danx-ui";

const open = ref(false);
</script>

<template>
  <div class="flex flex-col gap-2">
    <DanxButton @click="open = !open">{{ open ? "Hide" : "Show" }} details</DanxButton>
    <CollapseTransition>
      <div v-if="open" class="rounded border border-gray-200 p-3 dark:border-gray-700">
        CollapseTransition is the reusable height-animation primitive DanxAccordion is built on —
        usable anywhere an auto-height collapse is needed.
      </div>
    </CollapseTransition>
  </div>
</template>
