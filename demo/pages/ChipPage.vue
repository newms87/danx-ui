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
import variantsCode from "./chip-examples/Variants.vue?raw";
import withIconsCode from "./chip-examples/WithIcons.vue?raw";
import removableCode from "./chip-examples/Removable.vue?raw";
import autoColorCode from "./chip-examples/AutoColor.vue?raw";
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
      title="Variants"
      description="One chip per variant. Default (blank) has a subtle surface background."
      :code="variantsCode"
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

    <DemoSection
      title="Auto Colors"
      description="Deterministic colors from label text. Same label always gets the same color. Pass a string to autoColor to hash a custom key instead of the label."
      :code="autoColorCode"
    />
  </DemoPage>
</template>
