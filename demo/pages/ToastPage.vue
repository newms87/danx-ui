<script setup lang="ts">
/**
 * ToastPage
 *
 * Demo page for DanxToast component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import toastDocs from "../../docs/toast.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicToastCode from "./toast-examples/BasicToast.vue?raw";
import variantToastsCode from "./toast-examples/VariantToasts.vue?raw";
import positionsCode from "./toast-examples/Positions.vue?raw";
import stackingCode from "./toast-examples/Stacking.vue?raw";
import customContentCode from "./toast-examples/CustomContent.vue?raw";
import elementAnchoredCode from "./toast-examples/ElementAnchored.vue?raw";
</script>

<template>
  <DemoPage
    title="Toast"
    description="Transient notification messages with auto-dismiss, deduplication, and variant styling."
    :docs="toastDocs"
  >
    <DemoSection
      title="Basic Toast"
      description="Simple toast notification triggered by a button click."
      :code="basicToastCode"
    />

    <DemoSection
      title="Variants"
      description="Toast notifications with semantic color variants and default icons."
      :code="variantToastsCode"
    />

    <DemoSection
      title="Positions"
      description="9-position grid for screen-anchored toasts."
      :code="positionsCode"
    />

    <DemoSection
      title="Stacking &amp; Deduplication"
      description="Multiple toasts stack in the same region. Duplicate messages show a badge count."
      :code="stackingCode"
    />

    <DemoSection
      title="Element Anchored"
      description="Toast anchored to a target element with configurable placement."
      :code="elementAnchoredCode"
    />

    <DemoSection
      title="Custom Options"
      description="Custom duration, position, and non-dismissible toasts."
      :code="customContentCode"
    />
  </DemoPage>
</template>
