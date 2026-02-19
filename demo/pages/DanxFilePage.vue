<script setup lang="ts">
/**
 * DanxFilePage
 *
 * Demo page for DanxFile thumbnail component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import danxFileDocs from "../../docs/danx-file.md?raw";

import basicThumbnailCode from "./danx-file-examples/BasicThumbnail.vue?raw";
import videoThumbnailCode from "./danx-file-examples/VideoThumbnail.vue?raw";
import progressStatesCode from "./danx-file-examples/ProgressStates.vue?raw";
import errorStateCode from "./danx-file-examples/ErrorState.vue?raw";
import fileTypeIconsCode from "./danx-file-examples/FileTypeIcons.vue?raw";
import actionsCode from "./danx-file-examples/Actions.vue?raw";
</script>

<template>
  <DemoPage
    title="DanxFile"
    description="A pure thumbnail card for file preview. Shows images, videos, progress, errors, and file-type icons."
    :docs="danxFileDocs"
  >
    <DemoSection
      title="Basic Thumbnail"
      description="Image thumbnails with different fit modes and filename overlay."
      :code="basicThumbnailCode"
    />

    <DemoSection
      title="Video Thumbnail"
      description="Video files show a play icon overlay on the thumbnail."
      :code="videoThumbnailCode"
    />

    <DemoSection
      title="Progress States"
      description="Auto-detected from file.progress. Default text or custom statusMessage."
      :code="progressStatesCode"
    />

    <DemoSection
      title="Error State"
      description="Red overlay with warning icon when file.error is set."
      :code="errorStateCode"
    />

    <DemoSection
      title="File-Type Icons"
      description="Non-previewable files show MIME-based icons (PDF, ZIP, text, etc.)."
      :code="fileTypeIconsCode"
    />

    <DemoSection
      title="Download & Remove Actions"
      description="Hover actions for download and remove. Remove uses 2-step confirmation."
      :code="actionsCode"
    />
  </DemoPage>
</template>
