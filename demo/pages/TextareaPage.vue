<script setup lang="ts">
/**
 * TextareaPage
 *
 * Demo page for DanxTextarea component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./textarea-examples/BasicUsage.vue?raw";
import sizesCode from "./textarea-examples/Sizes.vue?raw";
import rowsCode from "./textarea-examples/Rows.vue?raw";
import autoResizeCode from "./textarea-examples/AutoResize.vue?raw";
import clearableCode from "./textarea-examples/Clearable.vue?raw";
import charCountCode from "./textarea-examples/CharCount.vue?raw";
import statesCode from "./textarea-examples/States.vue?raw";
</script>

<template>
  <DemoPage
    title="Textarea"
    description="A multi-line text input with auto-resize, clearable, character count, and full form field integration."
  >
    <DemoSection
      title="Basic Usage"
      description="Simple textarea with v-model binding and label."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes: sm, md (default), and lg."
      :code="sizesCode"
    />

    <DemoSection
      title="Rows"
      description="Control the visible height with the rows prop."
      :code="rowsCode"
    />

    <DemoSection
      title="Auto-Resize"
      description="Automatically grows to fit content. The rows prop sets the minimum height."
      :code="autoResizeCode"
    />

    <DemoSection
      title="Clearable"
      description="Shows an X button to clear the value."
      :code="clearableCode"
    />

    <DemoSection
      title="Character Count"
      description="Display character count with optional maxlength limit indicator."
      :code="charCountCode"
    />

    <DemoSection
      title="States"
      description="Error, helper text, disabled, readonly, and required states."
      :code="statesCode"
    />
  </DemoPage>
</template>
