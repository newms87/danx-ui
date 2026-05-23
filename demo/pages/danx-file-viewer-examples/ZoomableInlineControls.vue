<script setup>
import { ref } from "vue";
import { DanxZoomable, DanxZoomControls } from "danx-ui";

const zoom = ref(100);
const pan = ref({ x: 0, y: 0 });
</script>

<template>
  <div class="w-full h-[420px] border border-border rounded-lg overflow-hidden">
    <DanxZoomable v-model:zoom="zoom" v-model:pan="pan">
      <template #controls>
        <DanxZoomControls v-model:zoom="zoom" compact />
      </template>
      <div class="w-full h-full flex items-center justify-center bg-surface">
        <svg viewBox="0 0 200 200" class="w-2/3 h-2/3">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" stroke-width="4" />
          <circle cx="70" cy="80" r="10" fill="currentColor" />
          <circle cx="130" cy="80" r="10" fill="currentColor" />
          <path
            d="M 60 130 Q 100 160 140 130"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </DanxZoomable>
  </div>
</template>
