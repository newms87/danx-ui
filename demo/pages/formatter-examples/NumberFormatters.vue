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
  fBoolean,
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
  { label: "fBoolean(true)", result: fBoolean(true) },
  { label: "fBoolean(false)", result: fBoolean(false) },
  { label: "fBoolean(null)", result: fBoolean(null) },
  { label: "fPercent(0.452)", result: fPercent(0.452) },
  { label: "fPercent(0.85)", result: fPercent(0.85) },
]);
</script>

<template>
  <div>
    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem">
      <span>Input value:</span>
      <input
        v-model.number="amount"
        type="number"
        style="
          padding: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: 0.25rem;
          background: var(--color-surface);
          color: var(--color-text);
        "
      />
    </label>
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
