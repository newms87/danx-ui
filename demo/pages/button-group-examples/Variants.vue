<script setup lang="ts">
import { ref } from "vue";
import { DanxButtonGroup } from "danx-ui";

const defaultSelected = ref("on");
const dangerSelected = ref("on");
const successSelected = ref("on");
const warningSelected = ref("on");
const infoSelected = ref("on");

const buttons = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <p class="mb-2 text-sm text-text-muted">Default</p>
      <DanxButtonGroup v-model="defaultSelected" :buttons="buttons" />
    </div>
    <div>
      <p class="mb-2 text-sm text-text-muted">Danger</p>
      <DanxButtonGroup v-model="dangerSelected" :buttons="buttons" variant="danger" />
    </div>
    <div>
      <p class="mb-2 text-sm text-text-muted">Success</p>
      <DanxButtonGroup v-model="successSelected" :buttons="buttons" variant="success" />
    </div>
    <div>
      <p class="mb-2 text-sm text-text-muted">Warning</p>
      <DanxButtonGroup v-model="warningSelected" :buttons="buttons" variant="warning" />
    </div>
    <div>
      <p class="mb-2 text-sm text-text-muted">Info</p>
      <DanxButtonGroup v-model="infoSelected" :buttons="buttons" variant="info" />
    </div>
  </div>
</template>
