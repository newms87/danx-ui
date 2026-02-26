<script setup lang="ts">
import { ref } from "vue";
import { DanxInput, DanxIcon } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput label="With prefix" placeholder="Amount">
      <template #prefix>
        <span class="text-slate-400 text-sm font-medium">$</span>
      </template>
    </DanxInput>
    <DanxInput label="With suffix" placeholder="Username">
      <template #suffix>
        <span class="text-slate-400 text-sm">@example.com</span>
      </template>
    </DanxInput>
    <DanxInput label="Both slots" placeholder="Weight">
      <template #prefix>
        <DanxIcon icon="gear" />
      </template>
      <template #suffix>
        <span class="text-slate-400 text-sm">kg</span>
      </template>
    </DanxInput>
  </div>
</template>
