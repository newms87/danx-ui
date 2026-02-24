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
