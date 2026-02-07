<script setup lang="ts">
/**
 * ButtonPage
 *
 * Demo page for DanxButton component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DocSection from "../components/DocSection.vue";

// Load markdown documentation as raw string
import buttonDocs from "../../docs/button.md?raw";

// Load SFC examples as raw strings for live-editable demos
import allIconsCode from "./button-examples/AllIcons.vue?raw";
import customIconCode from "./button-examples/CustomIcon.vue?raw";
import danxIconCode from "./button-examples/DanxIcon.vue?raw";
import disabledCode from "./button-examples/Disabled.vue?raw";
import iconOnlyCode from "./button-examples/IconOnly.vue?raw";
import loadingCode from "./button-examples/Loading.vue?raw";
import semanticTypesCode from "./button-examples/SemanticTypes.vue?raw";
import sizesCode from "./button-examples/Sizes.vue?raw";
import textOnlyCode from "./button-examples/TextOnly.vue?raw";
</script>

<template>
  <div class="button-page">
    <h1>Button</h1>
    <p class="button-page__description">
      A button component with semantic color types and built-in icons.
    </p>

    <h2>Live Examples</h2>

    <DemoSection
      title="Semantic Types"
      description="One button per type. Default (blank) has no background color."
      :code="semanticTypesCode"
    />

    <DemoSection
      title="All Icons"
      description='All 24 built-in icons by name. Just use icon="name" — no imports needed.'
      :code="allIconsCode"
    />

    <DemoSection
      title="Text-Only Buttons"
      description="Buttons without icons for each semantic type."
      :code="textOnlyCode"
    />

    <DemoSection title="Button Sizes" description="Buttons in all five sizes." :code="sizesCode" />

    <DemoSection
      title="Icon-Only Buttons"
      description="Buttons without text, using tooltips."
      :code="iconOnlyCode"
    />

    <DemoSection
      title="Loading State"
      description="Button shows spinner during async operations."
      :code="loadingCode"
    />

    <DemoSection
      title="Disabled State"
      description="Disabled buttons cannot be clicked."
      :code="disabledCode"
    />

    <DemoSection
      title="Custom Icon via Slot"
      description="Override the icon using the icon slot."
      :code="customIconCode"
    />

    <DemoSection
      title="External SVG Icon"
      description="Import an SVG as a raw string via ?raw and bind it to :icon. Icons inherit currentColor."
      :code="danxIconCode"
    />

    <h2>Documentation</h2>
    <DocSection :content="buttonDocs" />
  </div>
</template>

<style scoped>
.button-page {
  max-width: 900px;
}

.button-page h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.button-page h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.button-page__description {
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  font-size: 1.125rem;
  line-height: 1.6;
}
</style>
