<script setup lang="ts">
/**
 * RangeSliderPage
 *
 * Demo page for DanxRangeSlider with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import rangeSliderDocs from "../../docs/range-slider.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./range-slider-examples/BasicUsage.vue?raw";
import dualHandleCode from "./range-slider-examples/DualHandle.vue?raw";
import hhmmFormatterCode from "./range-slider-examples/HHMMFormatter.vue?raw";
import disabledCode from "./range-slider-examples/Disabled.vue?raw";
import variantsCode from "./range-slider-examples/Variants.vue?raw";
import customTokensCode from "./range-slider-examples/CustomTokens.vue?raw";
</script>

<template>
  <DemoPage
    title="Range Slider"
    description="Single or dual-handle slider with v-model, step rounding, cross-prevention, keyboard support, and a formatter slot for the bubble label."
    :docs="rangeSliderDocs"
  >
    <DemoSection
      title="Basic Usage (single-handle)"
      description="Numeric v-model auto-detects single-handle mode."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Dual-handle"
      description="Pass a [number, number] tuple as v-model to auto-detect dual-handle mode. Handles cannot cross."
      :code="dualHandleCode"
    />

    <DemoSection
      title="HH:MM Formatter (slot)"
      description="Use the `value` slot to render the bubble label per-handle. Useful for time-window pickers (here: minutes of day → HH:MM)."
      :code="hhmmFormatterCode"
    />

    <DemoSection
      title="Disabled"
      description="Locks pointer + keyboard input and dims via the disabled-opacity token. Both single and dual modes."
      :code="disabledCode"
    />

    <DemoSection
      title="Variants"
      description="Fill + handle color wire through the shared variant system. Pass danger, success, warning, info, muted, or any custom variant name."
      :code="variantsCode"
    />

    <DemoSection
      title="Custom Tokens"
      description="Override --dx-range-slider-* tokens for brand colors or custom dimensions."
      :code="customTokensCode"
    />
  </DemoPage>
</template>
