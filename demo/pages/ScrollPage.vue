<script setup lang="ts">
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";
import scrollDocs from "../../docs/scroll.md?raw";
import basicUsageCode from "./scroll-examples/BasicUsage.vue?raw";
import persistentCode from "./scroll-examples/Persistent.vue?raw";
import horizontalCode from "./scroll-examples/HorizontalScroll.vue?raw";
import bothAxesCode from "./scroll-examples/BothAxes.vue?raw";
import sizesCode from "./scroll-examples/Sizes.vue?raw";
import variantsCode from "./scroll-examples/Variants.vue?raw";
import infiniteScrollCode from "./scroll-examples/InfiniteScroll.vue?raw";
</script>

<template>
  <DemoPage
    title="Scroll"
    description="Custom overlay scrollbar container with auto-hide, draggable thumb, size/variant customization, and opt-in infinite scroll."
    :docs="scrollDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Vertical scroll with auto-hiding custom scrollbar."
      :code="basicUsageCode"
    />
    <DemoSection
      title="Persistent"
      description="Always-visible scrollbar with the persistent prop."
      :code="persistentCode"
    />
    <DemoSection
      title="Horizontal"
      description="Horizontal scrolling with direction='horizontal'."
      :code="horizontalCode"
    />
    <DemoSection
      title="Both Axes"
      description="Scroll both vertically and horizontally with direction='both'."
      :code="bothAxesCode"
    />
    <DemoSection
      title="Sizes"
      description="Five size presets control thumb thickness: xs, sm, md, lg, xl."
      :code="sizesCode"
    />
    <DemoSection
      title="Variants"
      description="Color variants via the variant prop and useVariant()."
      :code="variantsCode"
    />
    <DemoSection
      title="Infinite Scroll"
      description="Opt-in infinite scroll with loading and done indicators."
      :code="infiniteScrollCode"
    />
  </DemoPage>
</template>
