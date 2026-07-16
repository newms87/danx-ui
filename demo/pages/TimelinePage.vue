<script setup lang="ts">
/**
 * TimelinePage
 *
 * Demo page for DanxTimeline / DanxTimelineItem with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import timelineDocs from "../../docs/timeline.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./timeline-examples/BasicUsage.vue?raw";
import semanticTypesCode from "./timeline-examples/SemanticTypes.vue?raw";
import customIconsCode from "./timeline-examples/CustomIcons.vue?raw";
import explicitChildrenCode from "./timeline-examples/ExplicitChildren.vue?raw";
</script>

<template>
  <DemoPage
    title="Timeline"
    description="A vertical activity/event timeline for audit logs, changelogs, and event history."
    :docs="timelineDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="An items array rendered as a connected vertical timeline."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Semantic Types"
      description="success/warning/error/info drive the marker color, matching the chip/alert type system."
      :code="semanticTypesCode"
    />

    <DemoSection
      title="Custom Icons"
      description="An icon per entry renders inside the marker, replacing the colored dot."
      :code="customIconsCode"
    />

    <DemoSection
      title="Explicit Children"
      description="DanxTimelineItem composed directly for full control over content markup."
      :code="explicitChildrenCode"
    />
  </DemoPage>
</template>
