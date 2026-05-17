<script setup lang="ts">
/**
 * ColorPickerPage
 *
 * Demo page for DanxColorPicker with live examples + documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import colorPickerDocs from "../../docs/color-picker.md?raw";

import basicUsageCode from "./color-picker-examples/BasicUsage.vue?raw";
import paletteCode from "./color-picker-examples/Palette.vue?raw";
import alphaCode from "./color-picker-examples/Alpha.vue?raw";
import outputFormatsCode from "./color-picker-examples/OutputFormats.vue?raw";
import variantsCode from "./color-picker-examples/Variants.vue?raw";
import clearableCode from "./color-picker-examples/Clearable.vue?raw";
import disabledCode from "./color-picker-examples/Disabled.vue?raw";
import customTokensCode from "./color-picker-examples/CustomTokens.vue?raw";
</script>

<template>
  <DemoPage
    title="Color Picker"
    description="Themed color input with a paired swatch that opens a full HSV / hue / alpha / palette / recents picker panel. Drop-in replacement for the OS color input with three-tier theming and zero runtime dependencies."
    :docs="colorPickerDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Hex text input + swatch button that opens the picker panel. Two-way bound via v-model."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Palette + Recents"
      description="Pass your own swatch palette. With `storageKey`, recents persist to localStorage and dedupe case-insensitively."
      :code="paletteCode"
    />

    <DemoSection
      title="Alpha Channel"
      description="Enable the alpha strip + alpha numeric input. Output format auto-carries alpha."
      :code="alphaCode"
    />

    <DemoSection
      title="Output Formats"
      description="Configure the emitted shape independent of which tab the operator used. HEX / RGB / RGBA / HSL / HSLA all supported."
      :code="outputFormatsCode"
    />

    <DemoSection
      title="Variants"
      description="Active-tab underline + accent token wire through the shared variant system."
      :code="variantsCode"
    />

    <DemoSection
      title="Clearable"
      description="Render a Clear button inside the panel that emits the configured `clearValue`."
      :code="clearableCode"
    />

    <DemoSection
      title="Disabled"
      description="`disabled` locks every control. `panelDisabled` keeps the text input live but blocks the popover."
      :code="disabledCode"
    />

    <DemoSection
      title="Custom Tokens"
      description="Override --dx-color-picker-* tokens for brand colors, larger swatches, custom panel dimensions."
      :code="customTokensCode"
    />
  </DemoPage>
</template>
