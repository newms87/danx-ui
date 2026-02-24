<script setup lang="ts">
/**
 * NumberFormatters - Demo examples for number formatting utilities
 */
import { ref, computed } from "vue";
import {
  fCurrency,
  fCurrencyNoCents,
  fNumber,
  fShortCurrency,
  fShortNumber,
  fShortSize,
  fPercent,
} from "danx-ui";

const amount = ref(1234567.89);

const examples = computed(() => [
  { label: "fCurrency", result: fCurrency(amount.value) },
  { label: "fCurrencyNoCents", result: fCurrencyNoCents(amount.value) },
  { label: "fNumber", result: fNumber(amount.value) },
  { label: "fShortCurrency", result: fShortCurrency(amount.value) },
  { label: "fShortNumber", result: fShortNumber(amount.value) },
  { label: "fShortSize (bytes)", result: fShortSize(amount.value) },
  { label: "fPercent", result: fPercent(amount.value) },
]);
</script>

<template>
  <div>
    <label class="flex items-center gap-2 mb-4">
      <span>Input value:</span>
      <input
        v-model.number="amount"
        type="number"
        class="p-2 border border-border rounded bg-surface text-text"
      />
    </label>
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
