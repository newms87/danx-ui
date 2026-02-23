<script setup>
import { ref } from "vue";
import { DanxScroll } from "danx-ui";

const sizes = ref(["xs", "sm", "md", "lg", "xl"]);
</script>

<template>
  <div class="flex gap-4 flex-wrap">
    <div v-for="s in sizes" :key="s" class="flex-1 min-w-[150px]">
      <div class="text-sm font-semibold mb-2 text-center">{{ s }}</div>
      <DanxScroll :size="s" persistent class="h-[200px] border border-border rounded-lg p-2">
        <div v-for="i in 30" :key="i" class="py-1 px-2 text-sm border-b border-border">
          Item {{ i }}
        </div>
      </DanxScroll>
    </div>
  </div>
</template>
