<script setup lang="ts">
/**
 * IconPage
 *
 * Demo page for DanxIcon component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import iconDocs from "../../docs/icon.md?raw";

// Load SFC examples as raw strings for live-editable demos
import allIconsCode from "./icon-examples/AllIcons.vue?raw";
import customSvgCode from "./icon-examples/CustomSvg.vue?raw";
import sizingCode from "./icon-examples/Sizing.vue?raw";
</script>

<template>
  <DemoPage
    title="Icon"
    description="A standardized icon renderer for built-in names, raw SVGs, and Vue components."
    :docs="iconDocs"
  >
    <DemoSection
      title="All Built-in Icons"
      description="Every icon registered in the icon registry, rendered by name."
      :code="allIconsCode"
    />

    <DemoSection
      title="Custom SVG"
      description="Pass a raw SVG string (imported or inline) as the icon prop."
      :code="customSvgCode"
    />

    <DemoSection
      title="Sizing"
      description="Control size via Tailwind classes or the --dx-icon-size CSS token."
      :code="sizingCode"
    />
  </DemoPage>
</template>
