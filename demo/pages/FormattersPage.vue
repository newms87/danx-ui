<script setup lang="ts">
/**
 * FormattersPage
 *
 * Demo page for number, string, and date/time formatting utilities.
 */
import DemoSection from "../components/DemoSection.vue";
import DemoPage from "../components/DemoPage.vue";

import formattersDocs from "../../docs/formatters.md?raw";

import numberCode from "./formatter-examples/NumberFormatters.vue?raw";
import booleanCode from "./formatter-examples/BooleanFormatters.vue?raw";
import stringCode from "./formatter-examples/StringFormatters.vue?raw";
import dateTimeCode from "./formatter-examples/DateTimeFormatters.vue?raw";
import arrayCode from "./formatter-examples/ArrayUtilities.vue?raw";
</script>

<template>
  <DemoPage
    title="Formatters"
    description="Utility functions for formatting numbers, strings, and dates."
    :docs="formattersDocs"
  >
    <DemoSection
      title="Number Formatters"
      description="Currency, percentages, shorthand notation, and file sizes."
      :code="numberCode"
    />

    <DemoSection
      title="Boolean Formatters"
      description="Human-readable yes/no/empty display for boolean and nullable values."
      :code="booleanCode"
    />

    <DemoSection
      title="String Formatters"
      description="Truncation, phone numbers, and name/count display."
      :code="stringCode"
    />

    <DemoSection
      title="Date/Time Formatters"
      description="Date formatting, durations, and relative time."
      :code="dateTimeCode"
    />

    <DemoSection
      title="Array Utilities"
      description="Aggregate and accessor functions for arrays: count, sum, average, min, max, first, last, and join."
      :code="arrayCode"
    />
  </DemoPage>
</template>
