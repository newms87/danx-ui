<script setup lang="ts">
/**
 * DividerPage
 *
 * Demo page for DanxDivider component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import dividerDocs from "../../docs/divider.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./divider-examples/BasicUsage.vue?raw";
import verticalCode from "./divider-examples/Vertical.vue?raw";
import withLabelCode from "./divider-examples/WithLabel.vue?raw";
import insetCode from "./divider-examples/Inset.vue?raw";
</script>

<template>
  <DemoPage
    title="Divider"
    description="A thin line separating content, with optional inset margin and label."
    :docs="dividerDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="A horizontal divider between content."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Vertical"
      description="A vertical divider between two items in a flex row."
      :code="verticalCode"
    />

    <DemoSection
      title="With Label"
      description="Text projected into the divider line (e.g. the common 'OR' pattern)."
      :code="withLabelCode"
    />

    <DemoSection
      title="Inset"
      description="Adds margin along the divider's cross-axis."
      :code="insetCode"
    />
  </DemoPage>
</template>
