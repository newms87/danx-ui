<script setup lang="ts">
/**
 * DanxFileViewerPage
 *
 * Demo page for DanxFileViewer viewer component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import danxFileViewerDocs from "../../docs/danx-file-viewer.md?raw";

import basicViewerCode from "./danx-file-viewer-examples/BasicNavigator.vue?raw";
import carouselNavigationCode from "./danx-file-viewer-examples/CarouselNavigation.vue?raw";
import dialogViewerCode from "./danx-file-viewer-examples/DialogViewer.vue?raw";
import withMetadataCode from "./danx-file-viewer-examples/WithMetadata.vue?raw";
</script>

<template>
  <DemoPage
    title="DanxFileViewer"
    description="A responsive standalone file viewer with carousel navigation, metadata, and keyboard support."
    :docs="danxFileViewerDocs"
  >
    <DemoSection
      title="Basic Viewer"
      description="Single file viewer embedded in a container."
      :code="basicViewerCode"
    />

    <DemoSection
      title="Carousel Navigation"
      description="Navigate between related files with arrows, keyboard, or thumbnail strip."
      :code="carouselNavigationCode"
    />

    <DemoSection
      title="Dialog Viewer"
      description="Click a DanxFile thumbnail to open DanxFileViewer in a DanxDialog."
      :code="dialogViewerCode"
    />

    <DemoSection
      title="With Metadata"
      description="File with EXIF metadata. Click the info button to toggle the metadata panel."
      :code="withMetadataCode"
    />
  </DemoPage>
</template>
