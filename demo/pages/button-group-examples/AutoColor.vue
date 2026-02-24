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
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <p class="mb-2 text-sm text-text-muted">
        Auto-color (active only):
      </p>
      <DanxButtonGroup v-model="selected" :buttons="buttons" auto-color multiple />
    </div>
    <div>
      <p class="mb-2 text-sm text-text-muted">
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
    <p class="text-text-muted">Selected: {{ selected }}</p>
  </div>
</template>
