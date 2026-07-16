<script setup lang="ts">
/**
 * HotkeysPage
 *
 * Demo page for the shared useHotkeys composable.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import hotkeysDocs from "../../docs/hotkeys.md?raw";

import basicHotkeyCode from "./hotkeys-examples/BasicHotkey.vue?raw";
import scopedHotkeyCode from "./hotkeys-examples/ScopedHotkey.vue?raw";
</script>

<template>
  <DemoPage
    title="Hotkeys"
    description="Register keyboard shortcuts with a normalized combo syntax and automatic cleanup."
    :docs="hotkeysDocs"
  >
    <DemoSection
      title="Basic Hotkey"
      description="A global mod+k binding with preventDefault."
      :code="basicHotkeyCode"
    />

    <DemoSection
      title="Scoped & Toggleable"
      description="Bind to a target element and toggle the listener with an enabled ref."
      :code="scopedHotkeyCode"
    />
  </DemoPage>
</template>
