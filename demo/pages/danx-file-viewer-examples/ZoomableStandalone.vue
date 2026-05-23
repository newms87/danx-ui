<script setup>
import { ref } from "vue";
import { DanxZoomable, DanxZoomControls } from "danx-ui";

const zoom = ref(100);
const pan = ref({ x: 0, y: 0 });
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2 text-sm">
      <span>Standalone zoomable image (Ctrl+wheel, Ctrl+drag, Ctrl+/-/0).</span>
      <DanxZoomControls v-model:zoom="zoom" />
    </div>
    <div class="w-full h-[420px] border border-border rounded-lg overflow-hidden">
      <DanxZoomable v-model:zoom="zoom" v-model:pan="pan">
        <div class="w-full h-full flex items-center justify-center">
          <img
            src="https://picsum.photos/seed/zoomable/900/600"
            alt="Zoomable image"
            class="max-w-full max-h-full"
          />
        </div>
      </DanxZoomable>
    </div>
  </div>
</template>
