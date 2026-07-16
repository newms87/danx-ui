<script setup lang="ts">
/**
 * EmptyStatePage
 *
 * Demo page for DanxEmptyState component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import emptyStateDocs from "../../docs/empty-state.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicCode from "./empty-state-examples/Basic.vue?raw";
import actionsCode from "./empty-state-examples/Actions.vue?raw";
import sizesAndIllustrationCode from "./empty-state-examples/SizesAndIllustration.vue?raw";
</script>

<template>
  <DemoPage
    title="Empty State"
    description="A declarative placeholder for empty lists, empty search results, and zero-data states."
    :docs="emptyStateDocs"
  >
    <DemoSection
      title="Basic"
      description="Minimal (title only) and with an icon plus description."
      :code="basicCode"
    />

    <DemoSection
      title="Actions"
      description="Calls-to-action rendered via the actions slot."
      :code="actionsCode"
    />

    <DemoSection
      title="Sizes & Illustration"
      description="Three size tokens (sm/md/lg) and a custom illustration slot."
      :code="sizesAndIllustrationCode"
    />
  </DemoPage>
</template>
