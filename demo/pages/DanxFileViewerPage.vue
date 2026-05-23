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
import withChildrenCode from "./danx-file-viewer-examples/WithChildren.vue?raw";
import advancedLayoutsCode from "./danx-file-viewer-examples/AdvancedLayouts.vue?raw";
import lockedLayoutCode from "./danx-file-viewer-examples/LockedLayout.vue?raw";
import zoomableStandaloneCode from "./danx-file-viewer-examples/ZoomableStandalone.vue?raw";
import zoomableInlineControlsCode from "./danx-file-viewer-examples/ZoomableInlineControls.vue?raw";
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
      title="With Children"
      description="Nested file navigation with breadcrumbs. The PDF has child pages, and one page has sub-children."
      :code="withChildrenCode"
    />

    <DemoSection
      title="With Metadata"
      description="File with EXIF metadata. Click the info button to toggle the metadata panel."
      :code="withMetadataCode"
    />

    <DemoSection
      title="Advanced Layouts (Sidebar + Continuous + Zoom)"
      description="Two independent toggles compose into four layouts — toggle vertical sidebar and continuous scroll in any combination. Photoshop-style zoom (Ctrl+wheel / Ctrl+drag / Ctrl+/-/0) is wired in too. Each toggle and the zoom value persist to localStorage per storage-key."
      :code="advancedLayoutsCode"
    />

    <DemoSection
      title="Locked Layout (Forced Continuous + Sidebar + Zoom)"
      description="Authoritative props pin the layout: continuous + sidebar are forced on and zoom is locked at 60%. The toggle buttons and zoom controls are hidden and localStorage is bypassed — the consumer owns these states regardless of any stored preference. Ctrl+drag still pans the document at the locked zoom. Contrast with the seed-only default-* props, which the user can override."
      :code="lockedLayoutCode"
    />

    <DemoSection
      title="Standalone DanxZoomable"
      description="The zoom + pan wrapper is reusable on its own — drop any content inside DanxZoomable. DanxZoomControls is a slider + readout + reset bar that binds to the same v-model:zoom."
      :code="zoomableStandaloneCode"
    />

    <DemoSection
      title="DanxZoomable with Inline Controls Slot"
      description="Render DanxZoomControls inside the controls slot for an inline overlay anchored to the wrapper instead of a separate toolbar."
      :code="zoomableInlineControlsCode"
    />
  </DemoPage>
</template>
