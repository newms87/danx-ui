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
  <table class="border-collapse w-full">
    <thead>
      <tr>
        <th class="text-left p-2 border-b-2 border-border">
          Expression
        </th>
        <th class="text-left p-2 border-b-2 border-border">
          Result
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="ex in examples" :key="ex.label">
        <td class="p-2 border-b border-border font-mono text-[0.8rem]">
          {{ ex.label }}
        </td>
        <td class="p-2 border-b border-border">
          {{ ex.result }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
