<script setup>
import { ref } from "vue";
import { DanxVirtualScroll, DanxDialog, DanxButton } from "danx-ui";
import { useLogDemo, levelColor } from "./useLogDemo.js";

const isOpen = ref(false);
const { logs, scrollPosition, autoScroll, keyFn, onScrollPositionUpdate } = useLogDemo();
</script>

<template>
  <DanxButton @click="isOpen = true">Open Log Viewer Dialog</DanxButton>

  <DanxDialog v-model="isOpen" title="Log Viewer">
    <div class="w-[50vw]">
      <div class="flex items-center gap-3 mb-3 text-sm">
        <span class="font-medium">{{ logs.length }} lines</span>
        <span :class="autoScroll ? 'text-green-500' : 'text-gray-400'">
          {{ autoScroll ? "Auto-scrolling" : "Paused — scroll to bottom to resume" }}
        </span>
      </div>

      <DanxVirtualScroll
        v-model:scrollPosition="scrollPosition"
        :items="logs"
        :default-item-size="28"
        :overscan="5"
        :key-fn="keyFn"
        debug
        size="sm"
        class="w-full h-[400px] border border-border rounded-lg bg-gray-950 font-mono text-xs"
        @update:scrollPosition="onScrollPositionUpdate"
      >
        <template #item="{ item }">
          <div class="flex gap-3 px-3 py-1 border-b border-gray-800 whitespace-pre-wrap">
            <span class="text-gray-500 shrink-0">{{ item.timestamp }}</span>
            <span class="shrink-0 w-12 font-bold" :style="levelColor(item.level)">{{
              item.level
            }}</span>
            <span class="text-gray-300">{{ item.message }}</span>
          </div>
        </template>
      </DanxVirtualScroll>
    </div>
  </DanxDialog>
</template>
