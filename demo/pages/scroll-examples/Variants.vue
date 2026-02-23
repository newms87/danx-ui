<script setup>
import { ref } from "vue";
import { DanxScroll } from "danx-ui";

const variants = ref(["danger", "success", "warning", "info"]);
</script>

<template>
  <div class="flex gap-4 flex-wrap">
    <div v-for="v in variants" :key="v" class="flex-1 min-w-[150px]">
      <div class="text-sm font-semibold mb-2 text-center">{{ v }}</div>
      <DanxScroll :variant="v" persistent class="h-[200px] border border-border rounded-lg p-2">
        <div v-for="i in 30" :key="i" class="py-1 px-2 text-sm border-b border-border">
          Item {{ i }}
        </div>
      </DanxScroll>
    </div>
  </div>
</template>
