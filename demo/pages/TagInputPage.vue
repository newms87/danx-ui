<script setup lang="ts">
/**
 * TagInputPage
 *
 * Demo page for DanxTagInput component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import tagInputDocs from "../../docs/tag-input.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicCode from "./tag-input-examples/Basic.vue?raw";
import validationCode from "./tag-input-examples/Validation.vue?raw";
</script>

<template>
  <DemoPage
    title="Tag Input"
    description="A chip-entry multi-value form field. Type text and press Enter or comma to commit each tag."
    :docs="tagInputDocs"
  >
    <DemoSection
      title="Basic"
      description="Type a tag, then press Enter or comma to commit it. Backspace on an empty draft removes the last tag."
      :code="basicCode"
    />

    <DemoSection
      title="Validation & Transform"
      description="Reject invalid candidates with `validate`, normalize candidates with `transform`."
      :code="validationCode"
    />
  </DemoPage>
</template>
