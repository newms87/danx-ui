<script setup>
import { ref } from "vue";
import { DanxStepper } from "danx-ui";

const activeStep = ref(1);

const steps = [
  { label: "Order placed", description: "We received your order" },
  { label: "Processing", description: "Preparing your items" },
  { label: "Shipped", description: "On its way to you" },
  { label: "Delivered", description: "Package has arrived" },
];
</script>

<template>
  <DanxStepper v-model="activeStep" :steps="steps" orientation="vertical" />
</template>
