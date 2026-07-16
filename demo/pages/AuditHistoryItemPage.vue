<script setup lang="ts">
/**
 * AuditHistoryItemPage
 *
 * Demo page for DanxAuditHistoryItem component with live examples and documentation.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

// Load markdown documentation as raw string
import auditHistoryItemDocs from "../../docs/audit-history-item.md?raw";

// Load SFC examples as raw strings for live-editable demos
import basicUsageCode from "./audit-history-item-examples/BasicUsage.vue?raw";
import fieldDiffCode from "./audit-history-item-examples/FieldDiff.vue?raw";
import descriptionFallbackCode from "./audit-history-item-examples/DescriptionFallback.vue?raw";
import actionColorsCode from "./audit-history-item-examples/ActionColors.vue?raw";
</script>

<template>
  <DemoPage
    title="AuditHistoryItem"
    description="A single change-log/audit-trail row: who did what, to which field, and when."
    :docs="auditHistoryItemDocs"
  >
    <DemoSection
      title="Basic Usage"
      description="A mix of create, update, and delete entries composed into a list."
      :code="basicUsageCode"
    />

    <DemoSection
      title="Field Diff"
      description="When field/oldValue/newValue are set, the row renders a before/after diff."
      :code="fieldDiffCode"
    />

    <DemoSection
      title="Description Fallback"
      description="When field is absent, the row falls back to the description text."
      :code="descriptionFallbackCode"
    />

    <DemoSection
      title="Action Colors"
      description="create/update/delete map to success/info/danger; any other action falls back to muted."
      :code="actionColorsCode"
    />
  </DemoPage>
</template>
