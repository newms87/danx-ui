<script setup lang="ts">
/**
 * ContextMenuPage
 *
 * Demo page for DanxContextMenu component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import contextMenuDocs from "../../docs/context-menu.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicContextMenuCode from "./context-menu-examples/BasicContextMenu.vue?raw";
import submenuContextMenuCode from "./context-menu-examples/SubmenuContextMenu.vue?raw";
import disabledAndDividersCode from "./context-menu-examples/DisabledAndDividers.vue?raw";
import iconsContextMenuCode from "./context-menu-examples/IconsContextMenu.vue?raw";
import customTokensCode from "./context-menu-examples/CustomTokens.vue?raw";
</script>

<template>
  <DemoPage
    title="Context Menu"
    description="A right-click context menu with nested submenus, icons, dividers, and viewport clamping."
    :docs="contextMenuDocs"
  >
    <DemoSection
      title="Basic Context Menu"
      description="Right-click to open a simple menu with Cut, Copy, Paste and keyboard shortcuts."
      :code="basicContextMenuCode"
    />

    <DemoSection
      title="Nested Submenus"
      description="Parent items with children render flyout submenus on hover or click."
      :code="submenuContextMenuCode"
    />

    <DemoSection
      title="Disabled Items & Dividers"
      description="Disabled items are visible but not clickable. Dividers separate groups."
      :code="disabledAndDividersCode"
    />

    <DemoSection
      title="Icons"
      description="SVG icons rendered alongside menu item labels."
      :code="iconsContextMenuCode"
    />

    <DemoSection
      title="Custom CSS Tokens"
      description="Override CSS tokens to customize the menu appearance."
      :code="customTokensCode"
    />
  </DemoPage>
</template>
