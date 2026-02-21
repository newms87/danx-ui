<script setup lang="ts">
/**
 * DialogPage
 *
 * Demo page for DanxDialog component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import dialogDocs from "../../docs/dialog.md?raw";

// Load SFC examples as raw strings for live-editable demos
import animatedSizeCode from "./dialog-examples/AnimatedSize.vue?raw";
import basicDialogCode from "./dialog-examples/BasicDialog.vue?raw";
import closeButtonCode from "./dialog-examples/CloseButtonVariations.vue?raw";
import confirmDialogCode from "./dialog-examples/ConfirmDialog.vue?raw";
import customSizeCode from "./dialog-examples/CustomSize.vue?raw";
import persistentDialogCode from "./dialog-examples/PersistentDialog.vue?raw";
import slotCustomizationCode from "./dialog-examples/SlotCustomization.vue?raw";
import stackedDialogsCode from "./dialog-examples/StackedDialogs.vue?raw";
import subtitleDialogCode from "./dialog-examples/SubtitleDialog.vue?raw";
</script>

<template>
  <DemoPage
    title="Dialog"
    description="A fully declarative dialog component built on the native <dialog> element."
    :docs="dialogDocs"
  >
    <DemoSection
      title="Basic Dialog"
      description="Simple dialog with title and X close button."
      :code="basicDialogCode"
    />

    <DemoSection
      title="Dialog with Subtitle"
      description="Dialog with both title and subtitle."
      :code="subtitleDialogCode"
    />

    <DemoSection
      title="Close Button Variations"
      description="Close button with default and custom text."
      :code="closeButtonCode"
    />

    <DemoSection
      title="Confirm Dialog with Loading"
      description="Dialog with confirm button that shows loading state."
      :code="confirmDialogCode"
    />

    <DemoSection
      title="Persistent Mode"
      description="Dialog that can't be closed by ESC or backdrop click."
      :code="persistentDialogCode"
    />

    <DemoSection
      title="Custom Sizing"
      description="Dialog with explicit width and height."
      :code="customSizeCode"
    />

    <DemoSection
      title="Animated Size Changes"
      description="Dialog smoothly animates when width/height props change."
      :code="animatedSizeCode"
    />

    <DemoSection
      title="Slot Customization"
      description="Using slots for custom content."
      :code="slotCustomizationCode"
    />

    <DemoSection
      title="Stacked Dialogs"
      description="Dialogs that open other dialogs form a navigation stack with breadcrumbs."
      :code="stackedDialogsCode"
    />
  </DemoPage>
</template>
