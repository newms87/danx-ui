<script setup lang="ts">
import { ref } from "vue";
import { DanxNumberInput } from "danx-ui";

const quantity = ref(1);
const guests = ref(null);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxNumberInput v-model="quantity" label="Quantity" />
    <DanxNumberInput v-model="guests" label="Guests" placeholder="How many?" />
    <p class="text-sm text-slate-500">
      Quantity: {{ quantity }} — Guests: {{ guests === null ? "null (empty)" : guests }}
    </p>
  </div>
</template>
