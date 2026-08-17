<script setup lang="ts">
import { ref } from "vue";
import { DanxNumberInput } from "danx-ui";

const seats = ref(4);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxNumberInput
      v-model="seats"
      label="Seats"
      helper-text="Steppers disable at the bounds; typing out of range settles on blur."
      :min="1"
      :max="8"
    />
    <p class="text-sm text-slate-500">Seats: {{ seats }}</p>
    <p class="text-sm text-slate-500">
      Type 99 and click away — clamping waits for blur so typing 5 on the way to 50 is not fought
      mid-keystroke.
    </p>
  </div>
</template>
