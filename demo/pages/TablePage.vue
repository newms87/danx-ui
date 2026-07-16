<script setup lang="ts">
/**
 * TablePage
 *
 * Demo page for DanxTable component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import tableDocs from "../../docs/table.md?raw";

import basicUsageCode from "./table-examples/BasicUsage.vue?raw";
import sortableColumnsCode from "./table-examples/SortableColumns.vue?raw";
import customCellSlotCode from "./table-examples/CustomCellSlot.vue?raw";
import emptyStateCode from "./table-examples/EmptyState.vue?raw";
</script>

<template>
  <DemoPage
    title="Table"
    description="A lightweight, declarative data table for static/synchronous data — columns declared via a columns prop with per-column cell/header slots, client-side sort indicator, and an empty-state slot."
    :docs="tableDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Columns declared via a columns prop, rows rendered against a row-key."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Sortable Columns"
      description="Sortable columns show a sort indicator and emit a { key, direction } sort event on click — DanxTable never reorders rows itself."
      :code="sortableColumnsCode"
    />

    <DemoSection
      title="Custom Cell Slot"
      description="Override a column's cell content via the #cell-{key} slot; falls back to the raw value otherwise."
      :code="customCellSlotCode"
    />

    <DemoSection
      title="Empty State"
      description="Provide the #empty slot for the no-data case."
      :code="emptyStateCode"
    />
  </DemoPage>
</template>
