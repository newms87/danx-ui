<script setup>
import { DanxScroll } from "danx-ui";
</script>

<template>
  <DanxScroll direction="horizontal" class="w-full h-[100px] border border-border rounded-lg p-2">
    <div class="flex gap-4 w-[2000px]">
      <div
        v-for="i in 30"
        :key="i"
        class="flex-shrink-0 w-[120px] h-[60px] bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center"
      >
        Card {{ i }}
      </div>
    </div>
  </DanxScroll>
</template>
