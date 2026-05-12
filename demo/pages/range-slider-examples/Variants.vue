<script setup>
import { ref } from "vue";
import { DanxRangeSlider } from "danx-ui";

const danger = ref(70);
const success = ref(60);
const warning = ref(50);
const info = ref(40);
const muted = ref(30);
</script>

<template>
  <div class="flex flex-col gap-6 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxRangeSlider v-model="danger" variant="danger" ariaLabel="Danger" />
      <span class="text-xs text-text-muted">danger</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRangeSlider v-model="success" variant="success" ariaLabel="Success" />
      <span class="text-xs text-text-muted">success</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRangeSlider v-model="warning" variant="warning" ariaLabel="Warning" />
      <span class="text-xs text-text-muted">warning</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRangeSlider v-model="info" variant="info" ariaLabel="Info" />
      <span class="text-xs text-text-muted">info</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRangeSlider v-model="muted" variant="muted" ariaLabel="Muted" />
      <span class="text-xs text-text-muted">muted</span>
    </div>
  </div>
</template>
