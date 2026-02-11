<script setup lang="ts">
/**
 * StringFormatters - Demo examples for string formatting utilities
 */
import {
  centerTruncate,
  fTruncate,
  fUppercase,
  fLowercase,
  fAddress,
  fPhone,
  fNameOrCount,
} from "danx-ui";

const examples = [
  {
    label: 'centerTruncate("A very long filename.pdf", 15)',
    result: centerTruncate("A very long filename.pdf", 15),
  },
  {
    label: 'centerTruncate("short.txt", 15)',
    result: centerTruncate("short.txt", 15),
  },
  { label: 'fPhone("5551234567")', result: fPhone("5551234567") },
  { label: 'fPhone("15551234567")', result: fPhone("15551234567") },
  {
    label: 'fNameOrCount([{name:"A"},{name:"B"}], "items")',
    result: fNameOrCount([{ name: "A" }, { name: "B" }], "items"),
  },
  {
    label: 'fNameOrCount({title:"My Report"}, "reports")',
    result: fNameOrCount({ title: "My Report" }, "reports"),
  },
  {
    label: 'fTruncate("A very long string that exceeds the limit", 20)',
    result: fTruncate("A very long string that exceeds the limit", 20),
  },
  { label: 'fTruncate("short", 20)', result: fTruncate("short", 20) },
  { label: 'fUppercase("hello world")', result: fUppercase("hello world") },
  { label: 'fLowercase("HELLO WORLD")', result: fLowercase("HELLO WORLD") },
  {
    label: 'fAddress({street:"123 Main St",city:"Springfield",state:"IL",zip:"62704"})',
    result: fAddress({ street: "123 Main St", city: "Springfield", state: "IL", zip: "62704" }),
  },
  {
    label: 'fAddress({city:"Springfield",state:"IL"})',
    result: fAddress({ city: "Springfield", state: "IL" }),
  },
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
