<script setup lang="ts">
/**
 * AccordionPage
 *
 * Demo page for DanxAccordion + CollapseTransition with live examples and
 * documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import accordionDocs from "../../docs/accordion.md?raw";

// Load SFC examples as raw strings for live-editable demos
import singleOpenCode from "./accordion-examples/SingleOpen.vue?raw";
import multiOpenCode from "./accordion-examples/MultiOpen.vue?raw";
import customHeaderCode from "./accordion-examples/CustomHeader.vue?raw";
import disabledItemCode from "./accordion-examples/DisabledItem.vue?raw";
import collapseTransitionCode from "./accordion-examples/CollapseTransitionStandalone.vue?raw";
</script>

<template>
  <DemoPage
    title="Accordion"
    description="Collapsible content sections with a clickable header and an animated panel."
    :docs="accordionDocs"
  >
    <DemoSection
      title="Single Open"
      description="Default mode — opening an item closes any other open item."
      :code="singleOpenCode"
    />

    <DemoSection
      title="Multi Open"
      description="Set multiple to allow any number of items open at once."
      :code="multiOpenCode"
    />

    <DemoSection
      title="Custom Header"
      description="The header scoped slot replaces the default item.label text."
      :code="customHeaderCode"
    />

    <DemoSection
      title="Disabled Item"
      description="Disabled items cannot be toggled and keep their current state."
      :code="disabledItemCode"
    />

    <DemoSection
      title="CollapseTransition (standalone)"
      description="The reusable height-animation primitive DanxAccordion is built on."
      :code="collapseTransitionCode"
    />
  </DemoPage>
</template>
