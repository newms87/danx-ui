<script setup lang="ts">
import { computed, ref } from "vue";
import { DanxCheckbox } from "danx-ui";

const options = ref([false, true, false]);

const allChecked = computed({
  get: () => options.value.every(Boolean),
  set: (value) => {
    options.value = options.value.map(() => value);
  },
});

const isIndeterminate = computed(
  () => options.value.some(Boolean) && !options.value.every(Boolean)
);
</script>

<template>
  <div class="flex flex-col gap-2">
    <DanxCheckbox v-model="allChecked" :indeterminate="isIndeterminate">Select all</DanxCheckbox>
    <div class="flex flex-col gap-2 pl-6">
      <DanxCheckbox v-for="(_, i) in options" :key="i" v-model="options[i]">
        Option {{ i + 1 }}
      </DanxCheckbox>
    </div>
  </div>
</template>
