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
import virtualScrollHorizontalCode from "./scroll-examples/VirtualScrollHorizontal.vue?raw";
import virtualScrollLocalCode from "./scroll-examples/VirtualScrollLocal.vue?raw";
import virtualScrollPositionCode from "./scroll-examples/VirtualScrollPosition.vue?raw";
import virtualScrollRemoteCode from "./scroll-examples/VirtualScrollRemote.vue?raw";
import virtualScrollDynamicCode from "./scroll-examples/VirtualScrollDynamic.vue?raw";
import virtualScrollLogViewerCode from "./scroll-examples/VirtualScrollLogViewer.vue?raw";
import virtualScrollInDialogCode from "./scroll-examples/VirtualScrollInDialog.vue?raw";
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
    <DemoSection
      title="Virtual Scroll — Local"
      description="Windowed rendering for 10,000 items. Only visible items are in the DOM."
      :code="virtualScrollLocalCode"
    />
    <DemoSection
      title="Virtual Scroll — Horizontal"
      description="Horizontal virtual scroll for filmstrip/card-carousel layouts. Only visible cards are in the DOM."
      :code="virtualScrollHorizontalCode"
    />
    <DemoSection
      title="Virtual Scroll — Scroll Position"
      description="Track and control scroll position via v-model:scrollPosition. The value is the first visible item index."
      :code="virtualScrollPositionCode"
    />
    <DemoSection
      title="Virtual Scroll — Remote"
      description="Virtual scroll with infinite scroll integration. Items load on demand and only the visible window renders."
      :code="virtualScrollRemoteCode"
    />
    <DemoSection
      title="Virtual Scroll — Dynamic"
      description="Virtual scroll with infinite scroll but no totalItems. The scrollbar grows as items load — useful when total count is unknown."
      :code="virtualScrollDynamicCode"
    />
    <DemoSection
      title="Virtual Scroll — Log Viewer"
      description="Live log viewer with auto-scroll. New lines appear every 1-5 seconds. Scroll up to pause, scroll back to bottom to resume."
      :code="virtualScrollLogViewerCode"
    />
    <DemoSection
      title="Virtual Scroll — In Dialog"
      description="Virtual scroll inside a DanxDialog. Tests scrollbar drag behavior within dialog overlay context."
      :code="virtualScrollInDialogCode"
    />
  </DemoPage>
</template>
