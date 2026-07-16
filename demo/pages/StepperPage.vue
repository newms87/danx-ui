<script setup lang="ts">
/**
 * StepperPage
 *
 * Demo page for DanxStepper component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import stepperDocs from "../../docs/stepper.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./stepper-examples/BasicUsage.vue?raw";
import clickableCode from "./stepper-examples/Clickable.vue?raw";
import verticalCode from "./stepper-examples/Vertical.vue?raw";
import errorStatusCode from "./stepper-examples/ErrorStatus.vue?raw";
import customLabelSlotCode from "./stepper-examples/CustomLabelSlot.vue?raw";
</script>

<template>
  <DemoPage
    title="Stepper"
    description="An ordered multi-step workflow progress indicator."
    :docs="stepperDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Horizontal steps with labels and descriptions."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Clickable Navigation"
      description="Non-linear navigation by clicking any step."
      :code="clickableCode"
    />

    <DemoSection
      title="Vertical Orientation"
      description="Steps stacked vertically with connecting lines."
      :code="verticalCode"
    />

    <DemoSection
      title="Error Status"
      description="Explicit status override to flag a step regardless of position."
      :code="errorStatusCode"
    />

    <DemoSection
      title="Custom Label Slot"
      description="Scoped slot for custom step label content."
      :code="customLabelSlotCode"
    />
  </DemoPage>
</template>
