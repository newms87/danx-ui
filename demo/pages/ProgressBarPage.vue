<script setup lang="ts">
/**
 * ProgressBarPage
 *
 * Demo page for DanxProgressBar component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import progressBarDocs from "../../docs/progress-bar.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./progress-bar-examples/BasicUsage.vue?raw";
import sizesCode from "./progress-bar-examples/Sizes.vue?raw";
import typesCode from "./progress-bar-examples/Types.vue?raw";
import effectsCode from "./progress-bar-examples/Effects.vue?raw";
import textPositionsCode from "./progress-bar-examples/TextPositions.vue?raw";
import indeterminateModeCode from "./progress-bar-examples/IndeterminateMode.vue?raw";
import bufferBarCode from "./progress-bar-examples/BufferBar.vue?raw";
import withIconCode from "./progress-bar-examples/WithIcon.vue?raw";
import kitchenSinkCode from "./progress-bar-examples/KitchenSink.vue?raw";
</script>

<template>
  <DemoPage
    title="Progress Bar"
    description="A progress bar component with visual effects, icon support, and token-based theming."
    :docs="progressBarDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Interactive slider to control progress value."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes: sm, md (default), and lg."
      :code="sizesCode"
    />

    <DemoSection
      title="Types"
      description="Semantic color types for different contexts."
      :code="typesCode"
    />

    <DemoSection
      title="Effects"
      description="Visual effects: striped, animated stripes, glow, shimmer, gradient, and combinations."
      :code="effectsCode"
    />

    <DemoSection
      title="Text Positions"
      description="Text inside the fill, above the track, beside the track, or a custom label."
      :code="textPositionsCode"
    />

    <DemoSection
      title="Indeterminate Mode"
      description="Animated sliding bar for unknown progress."
      :code="indeterminateModeCode"
    />

    <DemoSection
      title="Buffer Bar"
      description="Secondary fill for buffered loading, like video playback."
      :code="bufferBarCode"
    />

    <DemoSection
      title="With Icon"
      description="Icon displayed inside the fill area."
      :code="withIconCode"
    />

    <DemoSection
      title="Kitchen Sink"
      description="All features active: danger type, gradient, striped, animated stripes, glow, shimmer, and icon."
      :code="kitchenSinkCode"
    />
  </DemoPage>
</template>
