<script setup>
import { ref } from "vue";
import { DanxStepper } from "danx-ui";

const activeStep = ref(1);

const steps = [{ label: "Cart" }, { label: "Shipping" }, { label: "Payment" }, { label: "Done" }];
</script>

<template>
  <DanxStepper v-model="activeStep" :steps="steps" clickable />
</template>
