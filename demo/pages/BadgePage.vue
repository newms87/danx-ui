<script setup lang="ts">
/**
 * BadgePage
 *
 * Demo page for DanxBadge component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import badgeDocs from "../../docs/badge.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./badge-examples/BasicUsage.vue?raw";
import dotModeCode from "./badge-examples/DotMode.vue?raw";
import variantsCode from "./badge-examples/Variants.vue?raw";
import placementsCode from "./badge-examples/Placements.vue?raw";
</script>

<template>
  <DemoPage
    title="Badge"
    description="A wrapper component that overlays a count, dot, or label indicator on any content."
    :docs="badgeDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Count badges on buttons with increment, showZero, and max overflow."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Dot Mode"
      description="Minimal status dot indicators with different semantic colors."
      :code="dotModeCode"
    />

    <DemoSection
      title="Variants"
      description="One badge per variant with different semantic colors."
      :code="variantsCode"
    />

    <DemoSection
      title="Placements"
      description="Badge indicators on all four corners."
      :code="placementsCode"
    />
  </DemoPage>
</template>
