<script setup lang="ts">
import { ref } from "vue";
import { DanxAlert, DanxButton } from "danx-ui";

const visible = ref(true);
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxAlert v-if="visible" variant="success" dismissible @dismiss="visible = false">
      Your changes were published. Click the × to dismiss this banner.
    </DanxAlert>
    <DanxButton v-else variant="info" @click="visible = true">Show banner again</DanxButton>
  </div>
</template>
