<script setup lang="ts">
/**
 * PasteFilesPage
 *
 * Demo page for the shared usePasteFiles composable.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import pasteFilesDocs from "../../docs/paste-files.md?raw";

import basicPasteTargetCode from "./paste-files-examples/BasicPasteTarget.vue?raw";
import largeTextPasteCode from "./paste-files-examples/LargeTextPaste.vue?raw";
import imagesOnlyPasteCode from "./paste-files-examples/ImagesOnlyPaste.vue?raw";
import sizeLimitAndNamingCode from "./paste-files-examples/SizeLimitAndNaming.vue?raw";
</script>

<template>
  <DemoPage
    title="Paste Files"
    description="Turn a clipboard paste into File objects — pasted images, oversized text pastes converted to attachments, and clean fall-through for everything else."
    :docs="pasteFilesDocs"
  >
    <DemoSection
      title="Basic Paste Target"
      description="Inspect what a paste yielded and only preventDefault when files were produced."
      :code="basicPasteTargetCode"
    />

    <DemoSection
      title="Large Paste Becomes a File"
      description="Text longer than the threshold is converted to a text/plain file, with the original text returned so the paste can be undone."
      :code="largeTextPasteCode"
    />

    <DemoSection
      title="Images Only"
      description="An accept filter keeps non-images out — including the file synthesized from a large text paste, which falls through as text instead."
      :code="imagesOnlyPasteCode"
    />

    <DemoSection
      title="Size Limits & Custom Naming"
      description="Reject oversized files with a displayable message and name converted text pastes yourself."
      :code="sizeLimitAndNamingCode"
    />
  </DemoPage>
</template>
