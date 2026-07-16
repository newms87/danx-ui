<script setup lang="ts">
/**
 * KbdPage
 *
 * Demo page for DanxKbd component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import kbdDocs from "../../docs/kbd.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./kbd-examples/BasicUsage.vue?raw";
import osAwareCode from "./kbd-examples/OsAware.vue?raw";
import separatorCode from "./kbd-examples/Separator.vue?raw";
</script>

<template>
  <DemoPage
    title="Kbd"
    description="A generic keyboard-shortcut display primitive with OS-aware key labels."
    :docs="kbdDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Single keys and key combos rendered as key-cap badges."
      :code="basicUsageCode"
    />

    <DemoSection
      title="OS-aware Labels"
      description="Modifier keys map to Mac symbols or word labels, auto-detected or forced via the os prop."
      :code="osAwareCode"
    />

    <DemoSection
      title="Custom Separator"
      description="Override the separator rendered between combo key-caps."
      :code="separatorCode"
    />
  </DemoPage>
</template>
