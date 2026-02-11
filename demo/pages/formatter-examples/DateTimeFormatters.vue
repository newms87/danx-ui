<script setup lang="ts">
/**
 * DateTimeFormatters - Demo examples for date/time formatting utilities
 */
import {
  fDate,
  fDateTime,
  fSlashDate,
  dbDateTime,
  fSecondsToTime,
  fSecondsToDuration,
  fMillisecondsToDuration,
  fTimeAgo,
  DateTime,
} from "danx-ui";

const now = DateTime.now();
const fiveMinAgo = now.minus({ minutes: 5 }).toISO();
const twoHoursAgo = now.minus({ hours: 2 }).toISO();
const threeDaysAgo = now.minus({ days: 3 }).toISO();

const examples = [
  { label: 'fDate("2024-01-15")', result: fDate("2024-01-15") },
  { label: 'fDateTime("2024-01-15 14:30:00")', result: fDateTime("2024-01-15 14:30:00") },
  { label: 'fSlashDate("2024-01-15")', result: fSlashDate("2024-01-15") },
  { label: 'dbDateTime("2024-01-15 14:30:00")', result: dbDateTime("2024-01-15 14:30:00") },
  { label: "fSecondsToTime(3661)", result: fSecondsToTime(3661) },
  { label: "fSecondsToDuration(3661)", result: fSecondsToDuration(3661) },
  { label: "fMillisecondsToDuration(3661500)", result: fMillisecondsToDuration(3661500) },
  { label: "fTimeAgo(5 min ago)", result: fTimeAgo(fiveMinAgo!) },
  { label: "fTimeAgo(2 hours ago)", result: fTimeAgo(twoHoursAgo!) },
  { label: "fTimeAgo(3 days ago)", result: fTimeAgo(threeDaysAgo!) },
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
