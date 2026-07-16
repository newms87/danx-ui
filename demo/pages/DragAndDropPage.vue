<script setup lang="ts">
/**
 * DragAndDropPage
 *
 * Demo page for useDragAndDrop + DanxDragHandle with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import dragAndDropDocs from "../../docs/drag-and-drop.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./drag-and-drop-examples/BasicUsage.vue?raw";
import horizontalReorderCode from "./drag-and-drop-examples/HorizontalReorder.vue?raw";
</script>

<template>
  <DemoPage
    title="Drag And Drop"
    description="Pointer- and keyboard-driven list reordering via useDragAndDrop, paired with the DanxDragHandle grip affordance."
    :docs="dragAndDropDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Vertical list reordered by dragging the handle or grabbing it with Space/Enter and moving with arrow keys."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Horizontal Reorder"
      description="Horizontal orientation moves items with Left/Right arrows instead of Up/Down."
      :code="horizontalReorderCode"
    />
  </DemoPage>
</template>
