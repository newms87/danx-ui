<script setup lang="ts">
/**
 * TogglePage
 *
 * Demo page for DanxToggle with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import toggleDocs from "../../docs/toggle.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./toggle-examples/BasicUsage.vue?raw";
import sizesCode from "./toggle-examples/Sizes.vue?raw";
import disabledCode from "./toggle-examples/Disabled.vue?raw";
import withLabelCode from "./toggle-examples/WithLabel.vue?raw";
import variantsCode from "./toggle-examples/Variants.vue?raw";
import customTokensCode from "./toggle-examples/CustomTokens.vue?raw";
</script>

<template>
  <DemoPage
    title="Toggle"
    description="Accessible boolean switch with v-model, sized variants, disabled state, and ARIA role='switch'."
    :docs="toggleDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Default toggle with v-model binding."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes (sm, md, lg) via top-level BEM modifier classes."
      :code="sizesCode"
    />

    <DemoSection
      title="Disabled"
      description="Locks interaction and dims via the disabled-opacity token."
      :code="disabledCode"
    />

    <DemoSection
      title="With Label"
      description="Default slot renders a label next to the switch. Clicking the label toggles via native label-for-input semantics."
      :code="withLabelCode"
    />

    <DemoSection
      title="Variants"
      description="On-state track color wires through the shared variant system. Pass danger, success, warning, info, muted, or any custom variant name."
      :code="variantsCode"
    />

    <DemoSection
      title="Custom Tokens"
      description="Override --dx-toggle-* tokens for brand colors or custom dimensions."
      :code="customTokensCode"
    />
  </DemoPage>
</template>
