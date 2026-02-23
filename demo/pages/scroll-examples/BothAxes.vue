<script setup>
import { DanxScroll } from "danx-ui";
</script>

<template>
  <DanxScroll direction="both" class="w-full h-[300px] border border-border rounded-lg p-2">
    <div style="width: 1500px">
      <div v-for="i in 50" :key="i" class="py-2 px-3 border-b border-border whitespace-nowrap">
        Row {{ i }} — This content is wide enough to require horizontal scrolling as well as
        vertical
      </div>
    </div>
  </DanxScroll>
</template>
