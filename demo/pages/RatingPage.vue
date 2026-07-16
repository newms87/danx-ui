<script setup lang="ts">
/**
 * RatingPage
 *
 * Demo page for DanxRating with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import ratingDocs from "../../docs/rating.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./rating-examples/BasicUsage.vue?raw";
import halfStarsCode from "./rating-examples/HalfStars.vue?raw";
import maxAndIconCode from "./rating-examples/MaxAndIcon.vue?raw";
import readonlyCode from "./rating-examples/Readonly.vue?raw";
import variantsCode from "./rating-examples/Variants.vue?raw";
</script>

<template>
  <DemoPage
    title="Rating"
    description="Accessible star rating with v-model, hover-preview, half-step increments, keyboard support, and read-only display mode."
    :docs="ratingDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Click a star to set the rating. Hovering previews the value without committing it."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Half Stars"
      description="Pass `allowHalf` to enable 0.5-increment steps — the left half of a star selects n-0.5, the right half selects n."
      :code="halfStarsCode"
    />

    <DemoSection
      title="Max + Custom Icon"
      description="Control star count via `max` and swap the icon via `icon` (any DanxIcon-resolvable value)."
      :code="maxAndIconCode"
    />

    <DemoSection
      title="Readonly + Disabled"
      description="`readonly` displays the value (including partial fill) with no interaction or hover-preview. `disabled` does the same plus dims via the disabled-opacity token."
      :code="readonlyCode"
    />

    <DemoSection
      title="Variants"
      description="Filled-star color wires through the shared variant system. Pass danger, success, warning, info, muted, or any custom variant name."
      :code="variantsCode"
    />
  </DemoPage>
</template>
