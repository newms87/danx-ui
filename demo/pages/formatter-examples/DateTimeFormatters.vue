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
  { label: "fTimeAgo(5 min ago)", result: fTimeAgo(fiveMinAgo ?? "") },
  { label: "fTimeAgo(2 hours ago)", result: fTimeAgo(twoHoursAgo ?? "") },
  { label: "fTimeAgo(3 days ago)", result: fTimeAgo(threeDaysAgo ?? "") },
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
