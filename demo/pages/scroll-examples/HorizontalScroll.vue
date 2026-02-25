<script setup>
import { DanxScroll } from "danx-ui";
</script>

<template>
  <DanxScroll direction="horizontal" class="w-full h-[100px] border border-border rounded-lg p-2">
    <div class="flex gap-4 w-[2000px]">
      <div
        v-for="i in 30"
        :key="i"
        class="flex-shrink-0 w-[120px] h-[60px] rounded flex flex-col items-center justify-center text-sm font-medium shadow-sm"
        :style="{ backgroundColor: `hsl(${(i * 37) % 360}, 70%, 85%)` }"
      >
        <span class="text-gray-700">Card {{ i }}</span>
      </div>
    </div>
  </DanxScroll>
</template>
