<script setup lang="ts">
/**
 * UsageMeterPage
 *
 * Demo page for DanxUsageMeter component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import usageMeterDocs from "../../docs/usage-meter.md?raw";

// Load SFC examples as raw strings for live-editable demos
import storageQuotaCode from "./usage-meter-examples/StorageQuota.vue?raw";
import sizesCode from "./usage-meter-examples/Sizes.vue?raw";
import coloringCode from "./usage-meter-examples/Coloring.vue?raw";
import customFormattingCode from "./usage-meter-examples/CustomFormatting.vue?raw";
import budgetBurnDownCode from "./usage-meter-examples/BudgetBurnDown.vue?raw";
import edgeCasesCode from "./usage-meter-examples/EdgeCases.vue?raw";
</script>

<template>
  <DemoPage
    title="Usage Meter"
    description="A segmented usage/quota meter — one track split into labelled segments, plus a formatted used / total readout."
    :docs="usageMeterDocs"
  >
    <DemoSection
      title="Storage Quota"
      description="The canonical case: one capacity broken down by category, with a per-slice tooltip on hover."
      :code="storageQuotaCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes: sm, md (default), and lg."
      :code="sizesCode"
    />

    <DemoSection
      title="Coloring"
      description="Per-segment variants, a single meter-level variant, or explicit CSS colors for data-driven palettes."
      :code="coloringCode"
    />

    <DemoSection
      title="Number Formatting"
      description="The default formatter abbreviates (355400 → 355.4k). Swap it per meter, or replace the readout entirely with the readout slot."
      :code="customFormattingCode"
    />

    <DemoSection
      title="Capacity Planning"
      description="Interactive burn-down: commit past the total and the track stays proportional while the readout reports the real over-commitment."
      :code="budgetBurnDownCode"
    />

    <DemoSection
      title="Edge Cases"
      description="Zero total, negative and NaN values, over capacity, and a bare meter with no readout or tooltips."
      :code="edgeCasesCode"
    />
  </DemoPage>
</template>
