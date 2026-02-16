<script setup lang="ts">
/**
 * ButtonGroupPage
 *
 * Demo page for DanxButtonGroup component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import buttonGroupDocs from "../../docs/button-group.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./button-group-examples/BasicUsage.vue?raw";
import multiSelectCode from "./button-group-examples/MultiSelect.vue?raw";
import autoColorCode from "./button-group-examples/AutoColor.vue?raw";
import withCallbacksCode from "./button-group-examples/WithCallbacks.vue?raw";
</script>

<template>
  <DemoPage
    title="Button Group"
    description="Toggle button group with single or multi-select, auto-color, and per-button callbacks."
    :docs="buttonGroupDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Single-select toggle buttons with icons."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Multi-Select"
      description="Multiple buttons can be toggled on/off simultaneously."
      :code="multiSelectCode"
    />

    <DemoSection
      title="Auto Color"
      description="Deterministic colors based on button labels, in active-only and always modes."
      :code="autoColorCode"
    />

    <DemoSection
      title="With Callbacks"
      description="Per-button onClick callbacks and select/deselect events."
      :code="withCallbacksCode"
    />
  </DemoPage>
</template>
