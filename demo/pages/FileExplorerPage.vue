<script setup lang="ts">
/**
 * FileExplorerPage
 *
 * Demo page for DanxFileExplorer component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import fileExplorerDocs from "../../docs/file-explorer.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./file-explorer-examples/BasicUsage.vue?raw";
import foldersOnlyCode from "./file-explorer-examples/FoldersOnly.vue?raw";
import customIconsAndActionsCode from "./file-explorer-examples/CustomIconsAndActions.vue?raw";
import inSplitPanelCode from "./file-explorer-examples/InSplitPanel.vue?raw";
</script>

<template>
  <DemoPage
    title="File Explorer"
    description="Recursive, expandable file/folder tree. Drops into any container (like a Split Panel), supports folders-only mode, custom icons, per-row actions, single selection, and localStorage persistence."
    :docs="fileExplorerDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="A nested tree with v-model:selected and v-model:expanded. Click a folder to expand/collapse, click a file to select it."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Folders Only"
      description="Toggle the foldersOnly prop to hide file nodes — useful for folder pickers. Folders with only file descendants still render as empty folders."
      :code="foldersOnlyCode"
    />

    <DemoSection
      title="Custom Icons, Node & Actions Slots"
      description="Override icons per node, customize the row via the #node slot, and add per-row controls via the #actions slot (revealed on hover/selection)."
      :code="customIconsAndActionsCode"
    />

    <DemoSection
      title="Inside a Split Panel"
      description="The explorer fills its container and overflows naturally, so it drops cleanly into a DanxSplitPanel panel without double scrollbars."
      :code="inSplitPanelCode"
    />
  </DemoPage>
</template>
