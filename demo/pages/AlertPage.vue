<script setup lang="ts">
/**
 * AlertPage
 *
 * Demo page for DanxAlert component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import alertDocs from "../../docs/alert.md?raw";

// Load SFC examples as raw strings for live-editable demos
import variantsCode from "./alert-examples/Variants.vue?raw";
import dismissibleCode from "./alert-examples/Dismissible.vue?raw";
import bodyOnlyCode from "./alert-examples/BodyOnly.vue?raw";
</script>

<template>
  <DemoPage
    title="Alert"
    description="An inline status/error banner with semantic variants, optional title, and a dismiss affordance."
    :docs="alertDocs"
  >
    <DemoSection
      title="Variants"
      description="One banner per variant. danger/warning are assertive (role=alert); success/info are polite (role=status)."
      :code="variantsCode"
    />

    <DemoSection
      title="Dismissible"
      description="Set dismissible to render a close button that emits the dismiss event."
      :code="dismissibleCode"
    />

    <DemoSection
      title="Body Only"
      description="Title is optional — the default slot accepts plain text or markup."
      :code="bodyOnlyCode"
    />
  </DemoPage>
</template>
