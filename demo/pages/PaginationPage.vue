<script setup lang="ts">
/**
 * PaginationPage
 *
 * Demo page for DanxPagination component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import paginationDocs from "../../docs/pagination.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./pagination-examples/BasicUsage.vue?raw";
import withPerPageAndGoToCode from "./pagination-examples/WithPerPageAndGoTo.vue?raw";
import fewPagesCode from "./pagination-examples/FewPages.vue?raw";
import disabledCode from "./pagination-examples/Disabled.vue?raw";
</script>

<template>
  <DemoPage
    title="Pagination"
    description="Prev/next buttons with a numbered page window and ellipsis truncation for large page counts."
    :docs="paginationDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="Dual v-model for page and perPage, bound directly to a ListController-style pager."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Per-Page Selector and Go-To-Page"
      description="Optional per-page selector dropdown and go-to-page numeric input."
      :code="withPerPageAndGoToCode"
    />

    <DemoSection
      title="Few Pages"
      description="When total pages fit within the visible window, every page renders with no ellipsis."
      :code="fewPagesCode"
    />

    <DemoSection title="Disabled" description="All controls disabled." :code="disabledCode" />
  </DemoPage>
</template>
