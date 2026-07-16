<script setup lang="ts">
/**
 * CheckboxPage
 *
 * Demo page for DanxCheckbox component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./checkbox-examples/BasicUsage.vue?raw";
import sizesCode from "./checkbox-examples/Sizes.vue?raw";
import variantsCode from "./checkbox-examples/Variants.vue?raw";
import indeterminateCode from "./checkbox-examples/Indeterminate.vue?raw";
import statesCode from "./checkbox-examples/States.vue?raw";
</script>

<template>
  <DemoPage
    title="Checkbox"
    description="An accessible boolean checkbox with v-model, sized variants, disabled state, indeterminate (mixed) state, and an optional clickable label."
  >
    <DemoSection
      title="Basic Usage"
      description="A bare checkbox and one with a clickable inline label."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes: sm, md (default), and lg."
      :code="sizesCode"
    />

    <DemoSection
      title="Variants"
      description="Checked-state box color wired through the shared variant system."
      :code="variantsCode"
    />

    <DemoSection
      title="Indeterminate"
      description="Mixed state for a 'select all' checkbox controlling a set of children."
      :code="indeterminateCode"
    />

    <DemoSection
      title="States"
      description="Error, helper text, disabled, readonly, and required states, rendered via DanxFieldWrapper."
      :code="statesCode"
    />
  </DemoPage>
</template>
