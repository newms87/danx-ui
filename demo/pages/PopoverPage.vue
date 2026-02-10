<script setup lang="ts">
/**
 * PopoverPage
 *
 * Demo page for DanxPopover component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import popoverDocs from "../../docs/popover.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicPopoverCode from "./popover-examples/BasicPopover.vue?raw";
import confirmPopoverCode from "./popover-examples/ConfirmPopover.vue?raw";
import placementsCode from "./popover-examples/OverlayVariants.vue?raw";
import customStyleCode from "./popover-examples/CustomSlots.vue?raw";
</script>

<template>
  <DemoPage
    title="Popover"
    description="A trigger-anchored floating panel with auto-positioning, click-outside dismissal, and CSS token styling."
    :docs="popoverDocs"
  >
    <DemoSection
      title="Basic Popover"
      description="A trigger button with a floating panel below it."
      :code="basicPopoverCode"
    />

    <DemoSection
      title="Form Popover"
      description="Popover with form content and action buttons."
      :code="confirmPopoverCode"
    />

    <DemoSection
      title="Placement Variants"
      description="Bottom, top, left, and right placement options."
      :code="placementsCode"
    />

    <DemoSection
      title="Custom Styling"
      description="CSS token overrides for a custom appearance."
      :code="customStyleCode"
    />
  </DemoPage>
</template>
