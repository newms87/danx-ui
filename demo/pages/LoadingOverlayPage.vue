<script setup lang="ts">
/**
 * LoadingOverlayPage
 *
 * Demo page for DanxLoadingOverlay component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import loadingOverlayDocs from "../../docs/loading-overlay.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicOverlayCode from "./loading-overlay-examples/BasicOverlay.vue?raw";
import withMessageCode from "./loading-overlay-examples/WithMessage.vue?raw";
import vModelCode from "./loading-overlay-examples/VModel.vue?raw";
import customTokensCode from "./loading-overlay-examples/CustomTokens.vue?raw";
</script>

<template>
  <DemoPage
    title="Loading Overlay"
    description="Semi-transparent overlay for showing a loading state on top of existing content."
    :docs="loadingOverlayDocs"
  >
    <DemoSection
      title="Basic Overlay"
      description="Dims a card/panel and shows a centered spinner while show is true."
      :code="basicOverlayCode"
    />

    <DemoSection
      title="With Message"
      description="Optional message text shown beneath the spinner."
      :code="withMessageCode"
    />

    <DemoSection
      title="v-model"
      description="Two-way binding via v-model:show."
      :code="vModelCode"
    />

    <DemoSection
      title="Custom Tokens"
      description="Override spinner size, color, and other tokens via CSS variables."
      :code="customTokensCode"
    />
  </DemoPage>
</template>
