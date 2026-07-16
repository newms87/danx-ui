<script setup lang="ts">
/**
 * DrawerPage
 *
 * Demo page for DanxDrawer component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import drawerDocs from "../../docs/drawer.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicDrawerCode from "./drawer-examples/BasicDrawer.vue?raw";
import sidesCode from "./drawer-examples/Sides.vue?raw";
import customSizeCode from "./drawer-examples/CustomSize.vue?raw";
import persistentDrawerCode from "./drawer-examples/PersistentDrawer.vue?raw";
import withFooterCode from "./drawer-examples/WithFooter.vue?raw";
</script>

<template>
  <DemoPage
    title="Drawer"
    description="A v-model-controlled slide-out overlay panel anchored to an edge of the viewport."
    :docs="drawerDocs"
  >
    <DemoSection
      title="Basic Drawer"
      description="Drawer sliding in from the right edge (default) with a title and close button."
      :code="basicDrawerCode"
    />

    <DemoSection
      title="Sides"
      description="Anchor the drawer to left, right, top, or bottom."
      :code="sidesCode"
    />

    <DemoSection
      title="Custom Size"
      description="Override the drawer's size along its sliding axis."
      :code="customSizeCode"
    />

    <DemoSection
      title="Persistent Drawer"
      description="Disable ESC and backdrop close; require an explicit action."
      :code="persistentDrawerCode"
    />

    <DemoSection
      title="With Footer"
      description="Use the footer slot for actions like Cancel/Apply."
      :code="withFooterCode"
    />
  </DemoPage>
</template>
