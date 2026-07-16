<script setup>
import { ref } from "vue";
import { DanxRating } from "danx-ui";

const danger = ref(2);
const success = ref(4);
const warning = ref(3);
const info = ref(5);
const muted = ref(1);
</script>

<template>
  <div class="flex flex-col gap-4 max-w-md">
    <div class="flex flex-col gap-2">
      <DanxRating v-model="danger" variant="danger" ariaLabel="Danger" />
      <span class="text-xs text-text-muted">danger</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRating v-model="success" variant="success" ariaLabel="Success" />
      <span class="text-xs text-text-muted">success</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRating v-model="warning" variant="warning" ariaLabel="Warning" />
      <span class="text-xs text-text-muted">warning</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRating v-model="info" variant="info" ariaLabel="Info" />
      <span class="text-xs text-text-muted">info</span>
    </div>
    <div class="flex flex-col gap-2">
      <DanxRating v-model="muted" variant="muted" ariaLabel="Muted" />
      <span class="text-xs text-text-muted">muted</span>
    </div>
  </div>
</template>
