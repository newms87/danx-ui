<script setup lang="ts">
/**
 * CardPage
 *
 * Demo page for DanxCard component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import cardDocs from "../../docs/card.md?raw";

// Load SFC examples as raw strings for live-editable demos
import bodyOnlyCode from "./card-examples/BodyOnly.vue?raw";
import titleSubtitleCode from "./card-examples/TitleSubtitle.vue?raw";
import variantsCode from "./card-examples/Variants.vue?raw";
import fullSlotsCode from "./card-examples/FullSlots.vue?raw";
</script>

<template>
  <DemoPage
    title="Card"
    description="A generic surface/container primitive with header, body, and footer slots."
    :docs="cardDocs"
  >
    <DemoSection
      title="Body Only"
      description="The default slot renders with no header or footer when neither is provided."
      :code="bodyOnlyCode"
    />

    <DemoSection
      title="Title / Subtitle"
      description="title/subtitle props render a convenience header when no header slot is given."
      :code="titleSubtitleCode"
    />

    <DemoSection
      title="Variants"
      description="elevated (shadow), outlined (border, default), and flat (neither)."
      :code="variantsCode"
    />

    <DemoSection
      title="Full Slots"
      description="header, default, and footer slots together, with a spacious padding density."
      :code="fullSlotsCode"
    />
  </DemoPage>
</template>
