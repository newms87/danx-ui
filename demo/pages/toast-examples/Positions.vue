<script setup lang="ts">
import { useToast, DanxButton } from "danx-ui";

const { toast } = useToast();

const positions = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center-center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function showAt(position) {
  toast(`Toast at ${position}`, { position, duration: 3000 });
}
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <DanxButton v-for="pos in positions" :key="pos" variant="info" @click="showAt(pos)">
      {{ pos }}
    </DanxButton>
  </div>
</template>
