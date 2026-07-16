<script setup>
import { ref } from "vue";
import { DanxStepper } from "danx-ui";

const activeStep = ref(1);

const steps = [{ label: "Plan" }, { label: "Build" }, { label: "Ship" }];
</script>

<template>
  <DanxStepper v-model="activeStep" :steps="steps">
    <template #label="{ step, status }">
      <span :class="status === 'active' ? 'font-bold' : ''">{{ step.label }}</span>
    </template>
  </DanxStepper>
</template>
