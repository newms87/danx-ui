<script setup lang="ts">
/**
 * ArrayUtilities - Demo examples for array utility functions
 */
import {
  arrayCount,
  arraySum,
  arrayAvg,
  arrayMin,
  arrayMax,
  arrayFirst,
  arrayLast,
  arrayJoin,
} from "danx-ui";

const items = [
  { name: "Alice", score: 85 },
  { name: "Bob", score: 92 },
  { name: "Carol", score: 78 },
];

const numbers = [10, 20, 30, 40, 50];

const examples = [
  { label: "arrayCount([10, 20, 30, 40, 50])", result: arrayCount(numbers) },
  { label: "arraySum([10, 20, 30, 40, 50])", result: arraySum(numbers) },
  { label: "arrayAvg([10, 20, 30, 40, 50])", result: arrayAvg(numbers) },
  { label: "arrayMin([10, 20, 30, 40, 50])", result: arrayMin(numbers) },
  { label: "arrayMax([10, 20, 30, 40, 50])", result: arrayMax(numbers) },
  { label: "arrayFirst([10, 20, 30, 40, 50])", result: arrayFirst(numbers) },
  { label: "arrayLast([10, 20, 30, 40, 50])", result: arrayLast(numbers) },
  { label: 'arrayJoin(["a", "b", "c"])', result: arrayJoin(["a", "b", "c"]) },
  { label: 'arrayJoin(["a", "b", "c"], " | ")', result: arrayJoin(["a", "b", "c"], " | ") },
  { label: 'arraySum(items, "score")', result: arraySum(items, "score") },
  { label: 'arrayAvg(items, "score")', result: arrayAvg(items, "score") },
  { label: 'arrayMin(items, "score")', result: arrayMin(items, "score") },
  { label: 'arrayMax(items, "score")', result: arrayMax(items, "score") },
  { label: 'arrayFirst(items, "name")', result: arrayFirst(items, "name") },
  { label: 'arrayLast(items, "name")', result: arrayLast(items, "name") },
];
</script>

<template>
  <table style="border-collapse: collapse; width: 100%">
    <thead>
      <tr>
        <th style="text-align: left; padding: 0.5rem; border-bottom: 2px solid var(--color-border)">
          Expression
        </th>
        <th style="text-align: left; padding: 0.5rem; border-bottom: 2px solid var(--color-border)">
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
            font-size: 0.8rem;
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
</template>
