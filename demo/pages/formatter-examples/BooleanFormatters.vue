<script setup lang="ts">
/**
 * BooleanFormatters - Demo examples for boolean formatting utility
 */
import { fBoolean } from "danx-ui";

const examples = [
  { label: "fBoolean(true)", result: fBoolean(true) },
  { label: "fBoolean(false)", result: fBoolean(false) },
  { label: "fBoolean(null)", result: fBoolean(null) },
];
</script>

<template>
  <div>
    <table style="border-collapse: collapse; width: 100%">
      <thead>
        <tr>
          <th
            style="text-align: left; padding: 0.5rem; border-bottom: 2px solid var(--color-border)"
          >
            Function
          </th>
          <th
            style="text-align: left; padding: 0.5rem; border-bottom: 2px solid var(--color-border)"
          >
            Result
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ex in examples" :key="ex.label">
          <td
            style="
              padding: 0.5rem;
              border-bottom: 1px solid var(--color-border);
              font-family: monospace;
            "
          >
            {{ ex.label }}
          </td>
          <td style="padding: 0.5rem; border-bottom: 1px solid var(--color-border)">
            {{ ex.result }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
