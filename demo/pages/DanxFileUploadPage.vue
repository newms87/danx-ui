<script setup lang="ts">
/**
 * DanxFileUploadPage
 *
 * Demo page for DanxFileUpload component with live examples.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import singleFileCode from "./danx-file-upload-examples/SingleFile.vue?raw";
import multiFileCode from "./danx-file-upload-examples/MultiFile.vue?raw";
import withValidationCode from "./danx-file-upload-examples/WithValidation.vue?raw";
</script>

<template>
  <DemoPage
    title="File Upload"
    description="A file upload component with drag-and-drop, progress tracking, validation, and DanxFile thumbnail rendering."
  >
    <DemoSection
      title="Single File"
      description="Single file mode replaces the existing file on new selection. Accepts images only."
      :code="singleFileCode"
    />

    <DemoSection
      title="Multiple Files"
      description="Multi file mode accumulates uploads up to a maxFiles limit. Shows filenames and file sizes."
      :code="multiFileCode"
    />

    <DemoSection
      title="Validation"
      description="Validates file type (accept) and size (maxFileSize). Rejected files show inline error states."
      :code="withValidationCode"
    />
  </DemoPage>
</template>
