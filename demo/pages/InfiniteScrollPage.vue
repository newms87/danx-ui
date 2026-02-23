<script setup lang="ts">
/**
 * InfiniteScrollPage
 *
 * Demo page for DanxInfiniteScroll component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import infiniteScrollDocs from "../../docs/infinite-scroll.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./infinite-scroll-examples/BasicUsage.vue?raw";
import customSlotsCode from "./infinite-scroll-examples/CustomSlots.vue?raw";
import directionTopCode from "./infinite-scroll-examples/DirectionTop.vue?raw";
</script>

<template>
  <DemoPage
    title="Infinite Scroll"
    description="A scrollable container that loads more content when the user reaches the edge."
    :docs="infiniteScrollDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Scroll to the bottom to load more items. Stops at 100 items."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Custom Slots"
      description="Custom loading and done slot content."
      :code="customSlotsCode"
    />

    <DemoSection
      title="Direction: Top"
      description="Scroll up to load older messages, like a chat history."
      :code="directionTopCode"
    />
  </DemoPage>
</template>
