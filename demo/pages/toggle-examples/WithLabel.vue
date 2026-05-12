<script setup>
import { ref } from "vue";
import { DanxToggle } from "danx-ui";

const alwaysOn = ref(true);
const notifications = ref(false);
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxToggle v-model="alwaysOn">Always on</DanxToggle>
    <DanxToggle v-model="notifications">Email notifications</DanxToggle>
    <p class="m-0 text-xs text-text-muted">
      Clicking the label toggles the switch via native &lt;label&gt; semantics.
    </p>
  </div>
</template>
