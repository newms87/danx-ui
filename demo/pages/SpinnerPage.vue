<script setup lang="ts">
/**
 * SpinnerPage
 *
 * Demo page for DanxSpinner component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import spinnerDocs from "../../docs/spinner.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./spinner-examples/BasicUsage.vue?raw";
import variantsCode from "./spinner-examples/Variants.vue?raw";
import inButtonCode from "./spinner-examples/InButton.vue?raw";
</script>

<template>
  <DemoPage
    title="Spinner"
    description="A standalone loading indicator built with pure CSS."
    :docs="spinnerDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Three sizes: sm, md, lg."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Variants"
      description="Spinner color via the shared variant token system."
      :code="variantsCode"
    />

    <DemoSection
      title="In a Button"
      description="DanxButton renders DanxSpinner internally for its loading state."
      :code="inButtonCode"
    />
  </DemoPage>
</template>
