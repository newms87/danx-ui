<script setup lang="ts">
/**
 * TreeViewPage
 *
 * Demo page for DanxTreeView component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import treeViewDocs from "../../docs/tree-view.md?raw";

import basicUsageCode from "./tree-view-examples/BasicUsage.vue?raw";
import multiSelectCode from "./tree-view-examples/MultiSelect.vue?raw";
import customNodeSlotCode from "./tree-view-examples/CustomNodeSlot.vue?raw";
</script>

<template>
  <DemoPage
    title="Tree View"
    description="Generic recursive tree for arbitrary hierarchical data — org charts, category trees, permission trees, nav menus. Supports single/multi selection, controlled/uncontrolled expansion, and a node-content slot."
    :docs="treeViewDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="A nested tree with v-model:selected and v-model:expanded. Click a branch to expand/collapse, click a leaf to select it."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Multi-Selection"
      description="Set the multiple prop to accumulate an array of selected node ids. Clicking a selected node deselects it."
      :code="multiSelectCode"
    />

    <DemoSection
      title="Custom Node Slot"
      description="Override the row content entirely via the #node slot to render arbitrary per-node data alongside the label."
      :code="customNodeSlotCode"
    />
  </DemoPage>
</template>
