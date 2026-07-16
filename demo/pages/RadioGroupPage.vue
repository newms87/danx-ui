<script setup lang="ts">
/**
 * RadioGroupPage
 *
 * Demo page for DanxRadioGroup component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./radio-group-examples/BasicUsage.vue?raw";
import orientationCode from "./radio-group-examples/Orientation.vue?raw";
import sizesCode from "./radio-group-examples/Sizes.vue?raw";
import disabledOptionsCode from "./radio-group-examples/DisabledOptions.vue?raw";
import statesCode from "./radio-group-examples/States.vue?raw";
import customOptionSlotCode from "./radio-group-examples/CustomOptionSlot.vue?raw";
</script>

<template>
  <DemoPage
    title="Radio Group"
    description="An accessible single-select group of native radio inputs with v-model, keyboard roving-focus navigation, and per-option disabling."
  >
    <DemoSection
      title="Basic Usage"
      description="A group of options bound to v-model."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Orientation"
      description="Vertical (default) or horizontal layout."
      :code="orientationCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes: sm, md (default), and lg."
      :code="sizesCode"
    />

    <DemoSection
      title="Disabled Options"
      description="Disable an individual option, or the entire group."
      :code="disabledOptionsCode"
    />

    <DemoSection
      title="States"
      description="Error, helper text, and required states, rendered via DanxFieldWrapper."
      :code="statesCode"
    />

    <DemoSection
      title="Custom Option Slot"
      description="Use the option scoped slot to fully customize per-option content."
      :code="customOptionSlotCode"
    />
  </DemoPage>
</template>
