<script setup lang="ts">
/**
 * DanxFileNavigatorPage
 *
 * Demo page for DanxFileNavigator viewer component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import danxFileNavigatorDocs from "../../docs/danx-file-navigator.md?raw";

import basicNavigatorCode from "./danx-file-navigator-examples/BasicNavigator.vue?raw";
import carouselNavigationCode from "./danx-file-navigator-examples/CarouselNavigation.vue?raw";
import dialogViewerCode from "./danx-file-navigator-examples/DialogViewer.vue?raw";
import withMetadataCode from "./danx-file-navigator-examples/WithMetadata.vue?raw";
</script>

<template>
  <DemoPage
    title="DanxFileNavigator"
    description="A responsive standalone file viewer with carousel navigation, metadata, and keyboard support."
    :docs="danxFileNavigatorDocs"
  >
    <DemoSection
      title="Basic Navigator"
      description="Single file viewer embedded in a container."
      :code="basicNavigatorCode"
    />

    <DemoSection
      title="Carousel Navigation"
      description="Navigate between related files with arrows, keyboard, or thumbnail strip."
      :code="carouselNavigationCode"
    />

    <DemoSection
      title="Dialog Viewer"
      description="Click a DanxFile thumbnail to open DanxFileNavigator in a DanxDialog."
      :code="dialogViewerCode"
    />

    <DemoSection
      title="With Metadata"
      description="File with EXIF metadata. Click the info button to toggle the metadata panel."
      :code="withMetadataCode"
    />
  </DemoPage>
</template>
