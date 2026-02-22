<script setup lang="ts">
/**
 * SplitPanelPage
 *
 * Demo page for DanxSplitPanel component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import splitPanelDocs from "../../docs/split-panel.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./split-panel-examples/BasicUsage.vue?raw";
import threePanelsCode from "./split-panel-examples/ThreePanels.vue?raw";
import horizontalSplitCode from "./split-panel-examples/HorizontalSplit.vue?raw";
import requireActiveCode from "./split-panel-examples/RequireActive.vue?raw";
</script>

<template>
  <DemoPage
    title="Split Panel"
    description="Resizable multi-panel layout with drag handles, toggleable panels, and localStorage persistence."
    :docs="splitPanelDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Two panels with drag-to-resize handle between them."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Three Panels with Toggles"
      description="Three toggleable panels using the toggles slot for custom toggle UI."
      :code="threePanelsCode"
    />

    <DemoSection
      title="Horizontal Split"
      description="Horizontal orientation stacks panels top-to-bottom with a vertical drag handle."
      :code="horizontalSplitCode"
    />

    <DemoSection
      title="Require Active"
      description="The requireActive prop prevents deactivating the last remaining panel."
      :code="requireActiveCode"
    />
  </DemoPage>
</template>
