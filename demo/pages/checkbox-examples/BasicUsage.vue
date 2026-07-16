<script setup lang="ts">
import { ref } from "vue";
import { DanxCheckbox } from "danx-ui";

const agreed = ref(false);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxCheckbox v-model="agreed" />
    <DanxCheckbox v-model="agreed">Accept the terms and conditions</DanxCheckbox>
  </div>
</template>
