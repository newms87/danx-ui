<script setup lang="ts">
import { ref, reactive } from "vue";
import { DanxActionButton } from "danx-ui";

const eventLog = ref([]);

const successAction = reactive({
  isApplying: false,
  name: "event-action",
  trigger: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: 1, status: "created" };
  },
});

const failAction = reactive({
  isApplying: false,
  name: "fail-action",
  trigger: async () => {
    await new Promise((_, reject) => setTimeout(() => reject(new Error("Network error")), 500));
  },
});

function onSuccess(response) {
  eventLog.value.push("success: " + JSON.stringify(response));
}
function onError(error) {
  eventLog.value.push("error: " + (error instanceof Error ? error.message : String(error)));
}
function onAlways() {
  eventLog.value.push("always: completed");
}
function clearLog() {
  eventLog.value = [];
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <div class="flex gap-3 items-center">
      <DanxActionButton
        :action="successAction"
        variant="success"
        icon="check"
        @success="onSuccess"
        @error="onError"
        @always="onAlways"
      >
        Succeed
      </DanxActionButton>
      <DanxActionButton
        :action="failAction"
        variant="danger"
        icon="close"
        @success="onSuccess"
        @error="onError"
        @always="onAlways"
      >
        Fail
      </DanxActionButton>
      <button
        class="text-xs text-text-muted bg-none border border-border rounded px-2 py-1 cursor-pointer"
        @click="clearLog"
      >
        Clear Log
      </button>
    </div>
    <pre
      v-if="eventLog.length"
      class="m-0 p-3 text-[0.8125rem] font-mono bg-surface-sunken border border-border rounded whitespace-pre-wrap"
      >{{ eventLog.join("\n") }}</pre
    >
  </div>
</template>
