<script setup lang="ts">
/**
 * InputPage
 *
 * Demo page for DanxInput component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./input-examples/BasicUsage.vue?raw";
import sizesCode from "./input-examples/Sizes.vue?raw";
import typesCode from "./input-examples/Types.vue?raw";
import slotsCode from "./input-examples/Slots.vue?raw";
import clearableCode from "./input-examples/Clearable.vue?raw";
import charCountCode from "./input-examples/CharCount.vue?raw";
import statesCode from "./input-examples/States.vue?raw";
</script>

<template>
  <DemoPage
    title="Input"
    description="A text input component with label, error/helper text, password reveal, search prefix, clearable, and character count."
  >
    <DemoSection
      title="Basic Usage"
      description="Simple text and email inputs with v-model binding."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Sizes"
      description="Three sizes: sm, md (default), and lg."
      :code="sizesCode"
    />

    <DemoSection
      title="Input Types"
      description="Supports text, email, password (with reveal toggle), number, search (with auto icon), date, time, url, and tel."
      :code="typesCode"
    />

    <DemoSection
      title="Prefix & Suffix Slots"
      description="Add content before or after the native input with prefix and suffix slots."
      :code="slotsCode"
    />

    <DemoSection
      title="Clearable"
      description="Shows an X button to clear the value. Search type is clearable by default."
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
