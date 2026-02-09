<script setup lang="ts">
import { CodeViewer } from "danx-ui";

const data = {
  theme: "comparison",
  colors: { primary: "#2563eb", accent: "#7c3aed" },
};
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%;">
    <div>
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600;">Dark (default)</p>
      <CodeViewer :model-value="data" theme="dark" />
    </div>
    <div>
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600;">Light</p>
      <CodeViewer :model-value="data" theme="light" />
    </div>
  </div>
</template>
