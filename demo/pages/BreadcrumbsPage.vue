<script setup lang="ts">
/**
 * BreadcrumbsPage
 *
 * Demo page for DanxBreadcrumbs component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import breadcrumbsDocs from "../../docs/breadcrumbs.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./breadcrumbs-examples/BasicUsage.vue?raw";
import withIconsCode from "./breadcrumbs-examples/WithIcons.vue?raw";
import clickHandlersCode from "./breadcrumbs-examples/ClickHandlers.vue?raw";
import customSeparatorCode from "./breadcrumbs-examples/CustomSeparator.vue?raw";
import separatorSlotCode from "./breadcrumbs-examples/SeparatorSlot.vue?raw";
import overflowCode from "./breadcrumbs-examples/Overflow.vue?raw";
</script>

<template>
  <DemoPage
    title="Breadcrumbs"
    description="A general-purpose navigation breadcrumb trail rendered inside a semantic nav element."
    :docs="breadcrumbsDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="A trail of items, each with a label and optional href. The last item is the current page."
      :code="basicUsageCode"
    />

    <DemoSection
      title="With Icons"
      description="Items can display an icon before their label."
      :code="withIconsCode"
    />

    <DemoSection
      title="Click Handlers"
      description="Items can use an onClick handler instead of an href for programmatic navigation."
      :code="clickHandlersCode"
    />

    <DemoSection
      title="Custom Separator"
      description="Override the default '/' separator via the separator prop."
      :code="customSeparatorCode"
    />

    <DemoSection
      title="Separator Slot"
      description="Fully replace the separator with custom content, such as an icon."
      :code="separatorSlotCode"
    />

    <DemoSection
      title="Overflow Collapsing"
      description="When the trail exceeds maxItems, the middle collapses behind an ellipsis, keeping the first and last items visible."
      :code="overflowCode"
    />
  </DemoPage>
</template>
