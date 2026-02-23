<script setup lang="ts">
/**
 * SkeletonPage
 *
 * Demo page for DanxSkeleton component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import skeletonDocs from "../../docs/skeleton.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicShapesCode from "./skeleton-examples/BasicShapes.vue?raw";
import textSkeletonCode from "./skeleton-examples/TextSkeleton.vue?raw";
import animationsCode from "./skeleton-examples/Animations.vue?raw";
import compositionCode from "./skeleton-examples/Composition.vue?raw";
import customTokensCode from "./skeleton-examples/CustomTokens.vue?raw";
</script>

<template>
  <DemoPage
    title="Skeleton"
    description="Content-shaped placeholder shown while data loads. Reduces perceived load time and prevents layout shift."
    :docs="skeletonDocs"
  >
    <DemoSection
      title="Basic Shapes"
      description="Rectangle (default), circle, and rounded shapes."
      :code="basicShapesCode"
    />

    <DemoSection
      title="Text Skeleton"
      description="Multi-line text placeholder with auto-shortened last line."
      :code="textSkeletonCode"
    />

    <DemoSection
      title="Animations"
      description="Pulse (opacity oscillation) vs wave (gradient sweep) animations."
      :code="animationsCode"
    />

    <DemoSection
      title="Composition"
      description="Combine multiple skeletons to create realistic loading states."
      :code="compositionCode"
    />

    <DemoSection
      title="Custom Tokens"
      description="Override colors, sizes, speed, and highlight via CSS variables."
      :code="customTokensCode"
    />
  </DemoPage>
</template>
