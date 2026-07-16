<script setup lang="ts">
/**
 * DropdownMenuPage
 *
 * Demo page for DanxDropdownMenu component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import dropdownMenuDocs from "../../docs/dropdown-menu.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicDropdownMenuCode from "./dropdown-menu-examples/BasicDropdownMenu.vue?raw";
import submenuDropdownMenuCode from "./dropdown-menu-examples/SubmenuDropdownMenu.vue?raw";
import iconsAndDisabledCode from "./dropdown-menu-examples/IconsAndDisabled.vue?raw";
</script>

<template>
  <DemoPage
    title="Dropdown Menu"
    description="A button-triggered action menu that composes DanxPopover and DanxContextMenu."
    :docs="dropdownMenuDocs"
  >
    <DemoSection
      title="Basic Dropdown Menu"
      description="A DanxButton trigger opens a menu with actions and a separator."
      :code="basicDropdownMenuCode"
    />

    <DemoSection
      title="Nested Submenus"
      description="Items with children render a flyout submenu on hover or click."
      :code="submenuDropdownMenuCode"
    />

    <DemoSection
      title="Icons & Disabled Items"
      description="Items support icons, and disabled items are visible but not clickable."
      :code="iconsAndDisabledCode"
    />
  </DemoPage>
</template>
