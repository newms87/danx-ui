<script setup>
import { DanxScroll } from "danx-ui";
</script>

<template>
  <DanxScroll class="w-full h-[300px] border border-border rounded-lg p-2">
    <div v-for="i in 50" :key="i" class="py-2 px-3 border-b border-border">Item {{ i }}</div>
  </DanxScroll>
</template>
