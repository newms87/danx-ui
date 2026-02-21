<script setup lang="ts">
import { ref } from "vue";
import { DanxButtonGroup } from "danx-ui";

const selected = ref(["Pending"]);

const buttons = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "In Review", label: "In Review" },
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "On Hold", label: "On Hold" },
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Scheduled", label: "Scheduled" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem">
    <div>
      <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted)">
        Auto-color (active only):
      </p>
      <DanxButtonGroup v-model="selected" :buttons="buttons" auto-color multiple />
    </div>
    <div>
      <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted)">
        Auto-color (always):
      </p>
      <DanxButtonGroup
        v-model="selected"
        :buttons="buttons"
        auto-color
        auto-color-mode="always"
        multiple
      />
    </div>
    <p style="color: var(--color-text-muted)">Selected: {{ selected }}</p>
  </div>
</template>
