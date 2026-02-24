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
    <table class="border-collapse w-full">
      <thead>
        <tr>
          <th class="text-left p-2 border-b-2 border-border">
            Function
          </th>
          <th class="text-left p-2 border-b-2 border-border">
            Result
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ex in examples" :key="ex.label">
          <td class="p-2 border-b border-border font-mono">
            {{ ex.label }}
          </td>
          <td class="p-2 border-b border-border">
            {{ ex.result }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
