<script setup lang="ts">
/**
 * ChipPage
 *
 * Demo page for DanxChip component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import chipDocs from "../../docs/chip.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./chip-examples/BasicUsage.vue?raw";
import sizesCode from "./chip-examples/Sizes.vue?raw";
import semanticTypesCode from "./chip-examples/SemanticTypes.vue?raw";
import withIconsCode from "./chip-examples/WithIcons.vue?raw";
import removableCode from "./chip-examples/Removable.vue?raw";
</script>

<template>
  <DemoPage
    title="Chip"
    description="A pill-shaped label with semantic color types, icons, and removable support."
    :docs="chipDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Simple chips with text, label prop, and tooltip."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Semantic Types"
      description="One chip per type. Default (blank) has a subtle surface background."
      :code="semanticTypesCode"
    />

    <DemoSection title="Chip Sizes" description="Chips in all six sizes." :code="sizesCode" />

    <DemoSection
      title="With Icons"
      description="Icons by name, by imported SVG string, and by slot."
      :code="withIconsCode"
    />

    <DemoSection
      title="Removable"
      description="Chips with remove button. Click X to remove from the list."
      :code="removableCode"
    />
  </DemoPage>
</template>
