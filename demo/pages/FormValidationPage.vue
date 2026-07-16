<script setup lang="ts">
/**
 * FormValidationPage
 *
 * Demo page for the useFormValidation composable.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import formValidationDocs from "../../docs/form-validation.md?raw";

import basicUsageCode from "./form-validation-examples/BasicUsage.vue?raw";
import asyncAndCrossFieldCode from "./form-validation-examples/AsyncAndCrossField.vue?raw";
</script>

<template>
  <DemoPage
    title="Form Validation"
    description="Declarative validation rules producing reactive error state consumed by DanxFieldWrapper-based fields."
    :docs="formValidationDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="required, email, and custom rules wired to DanxInput and DanxSelect, validated on submit."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Async & Cross-Field Validation"
      description="An async uniqueness check with a pending indicator, plus a cross-field 'passwords must match' rule."
      :code="asyncAndCrossFieldCode"
    />
  </DemoPage>
</template>
