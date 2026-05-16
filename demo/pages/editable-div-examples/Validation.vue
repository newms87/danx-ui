<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const value = ref("alpha");
const lastError = ref("");

function onInvalid(message) {
  lastError.value = message;
}

function onChange() {
  lastError.value = "";
}

function startsWithA(v) {
  return v.startsWith("a") ? null : "Value must start with 'a'";
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxEditableDiv
      v-model="value"
      :min-length="1"
      :max-length="20"
      :validate="startsWithA"
      placeholder="Must start with 'a'"
      @invalid="onInvalid"
      @change="onChange"
    />
    <div class="text-sm text-text-muted">
      {{ lastError ? `Error: ${lastError}` : `OK — value: "${value}"` }}
    </div>
  </div>
</template>
