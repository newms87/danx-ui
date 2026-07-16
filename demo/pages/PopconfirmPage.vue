<script setup lang="ts">
/**
 * PopconfirmPage
 *
 * Demo page for DanxPopconfirm component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import popconfirmDocs from "../../docs/popconfirm.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicPopconfirmCode from "./popconfirm-examples/BasicPopconfirm.vue?raw";
import asyncConfirmCode from "./popconfirm-examples/AsyncConfirm.vue?raw";
import cancelEventCode from "./popconfirm-examples/CancelEvent.vue?raw";
</script>

<template>
  <DemoPage
    title="Popconfirm"
    description="A lightweight inline confirmation popover — a packaged alternative to a full confirm dialog for destructive actions."
    :docs="popconfirmDocs"
  >
    <DemoSection
      title="Basic Popconfirm"
      description="Title, message, and confirm/cancel buttons anchored to a trigger."
      :code="basicPopconfirmCode"
    />

    <DemoSection
      title="Async Confirm"
      description="When the confirm handler returns a promise, the confirm button shows a loading spinner and the panel stays open until it settles."
      :code="asyncConfirmCode"
    />

    <DemoSection
      title="Confirm & Cancel Events"
      description="Cancel button, Escape, and outside-click all fire the cancel event."
      :code="cancelEventCode"
    />
  </DemoPage>
</template>
