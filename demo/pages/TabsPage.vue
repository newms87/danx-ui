<script setup lang="ts">
/**
 * TabsPage
 *
 * Demo page for DanxTabs component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import tabsDocs from "../../docs/tabs.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./tabs-examples/BasicUsage.vue?raw";
import withCountsCode from "./tabs-examples/WithCounts.vue?raw";
import customColorsCode from "./tabs-examples/CustomColors.vue?raw";
import noIconsCode from "./tabs-examples/NoIcons.vue?raw";
import withVariantsCode from "./tabs-examples/WithVariants.vue?raw";
import withSlotsCode from "./tabs-examples/WithSlots.vue?raw";
</script>

<template>
  <DemoPage
    title="Tabs"
    description="Connected tab buttons with a smooth sliding animated indicator."
    :docs="tabsDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Tab buttons with icons and v-model binding."
      :code="basicUsageCode"
    />

    <DemoSection
      title="With Counts"
      description="Tabs with count badges showing item quantities."
      :code="withCountsCode"
    />

    <DemoSection
      title="Custom Colors"
      description="Per-tab active indicator colors for semantic meaning."
      :code="customColorsCode"
    />

    <DemoSection title="No Icons" description="Text-only tabs without icons." :code="noIconsCode" />

    <DemoSection
      title="Variants"
      description="Color variants via the shared variant system."
      :code="withVariantsCode"
    />

    <DemoSection
      title="Custom Slots"
      description="Scoped slots for custom tab content."
      :code="withSlotsCode"
    />
  </DemoPage>
</template>
